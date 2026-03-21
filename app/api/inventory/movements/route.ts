import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

console.log("Loading inventory/movements route...");
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓" : "✗");
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓" : "✗");

let supabase: any;
try {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  console.log("Supabase client created successfully");
} catch (err) {
  console.error("Failed to create Supabase client:", err);
}

// GET - Obtener movimientos del inventario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const itemType = searchParams.get("item_type");
    const type = searchParams.get("type");

    console.log(
      "GET /api/inventory/movements - Fetching movements with limit:",
      limit,
    );

    let query = supabase
      .from("inventory_movements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (itemType) {
      query = query.eq("item_type", itemType);
    }

    if (type) {
      query = query.eq("type", type);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching movements:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Movements fetched successfully:", data?.length || 0);
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error in GET /api/inventory/movements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Crear nuevo movimiento
export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/inventory/movements - Creating movement");

    const body = await request.json();
    console.log("Request body:", body);

    const {
      type,
      item_type,
      item_id,
      item_name,
      quantity_before,
      quantity_changed,
      reason,
      reference_code,
      created_by,
    } = body;

    console.log("=== MOVIMIENTO DETAILS ===");
    console.log("Type:", type, `(should be "produccion" for auto-discount)`);
    console.log("Item Type:", item_type, `(should be "product" for auto-discount)`);
    console.log("Item ID:", item_id);
    console.log("Item Name:", item_name);
    console.log("Will process material discount?", type === "produccion" && item_type === "product");
    console.log("=======================");

    // Validación de campos requeridos
    if (
      !type ||
      !item_type ||
      !item_id ||
      !item_name ||
      quantity_before === undefined ||
      quantity_changed === undefined
    ) {
      console.error("Missing required fields");
      return NextResponse.json(
        {
          error:
            "Missing required fields: type, item_type, item_id, item_name, quantity_before, quantity_changed",
        },
        { status: 400 },
      );
    }

    // Ensure all quantities are integers
    const qty_before = Math.floor(Number(quantity_before));
    const qty_changed = Math.floor(Number(quantity_changed));
    const quantity_after = qty_before + qty_changed;

    // Primero, actualizar la cantidad en la tabla correspondiente (materials o products)
    const tableName = item_type === "material" ? "materials" : "products";
    const timestamp = new Date().toISOString();
    console.log(
      `Updating ${tableName} table for item_id: ${item_id}, new quantity: ${quantity_after}`,
    );

    // Preparar el objeto de actualización según el tipo de tabla
    const updateData =
      item_type === "material"
        ? {
            quantity: quantity_after,
            last_updated: timestamp,
          }
        : {
            inventory: quantity_after,
            updated_at: timestamp,
          };

    const { error: updateError } = await supabase
      .from(tableName)
      .update(updateData)
      .eq("id", item_id);

    if (updateError) {
      console.error(`Error updating ${tableName}:`, updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log(`${tableName} updated successfully`);

    // Si es un movimiento de producción de un producto, descontar materiales
    if (type === "produccion" && item_type === "product") {
      console.log(
        `Processing production materials for product_id: ${item_id}, quantity: ${qty_changed}`,
      );

      // Obtener la receta del producto
      const { data: recipes, error: recipesError } = await supabase
        .from("product_recipes")
        .select("id, material_id, quantity_needed, unit")
        .eq("product_id", item_id);

      if (recipesError) {
        console.error("Error fetching recipes:", recipesError);
        // No es un error fatal - continuamos sin descuentos
      } else if (recipes && recipes.length > 0) {
        console.log(`Found ${recipes.length} materials for this product`);

        // Para cada material en la receta, descontar la cantidad usada
        for (const recipe of recipes) {
          const material_id = recipe.material_id;
          const quantity_per_unit = Math.floor(Number(recipe.quantity_needed));
          const material_consumed = quantity_per_unit * qty_changed;

          console.log(
            `Processing material_id: ${material_id}, quantity_per_unit: ${quantity_per_unit}, total to discount: ${material_consumed}`,
          );

          // Obtener información del material
          const { data: materialData, error: materialError } = await supabase
            .from("materials")
            .select("id, name, quantity")
            .eq("id", material_id)
            .single();

          if (materialError) {
            console.error(`Error fetching material ${material_id}:`, materialError);
            continue;
          }

          const material_name = materialData?.name || "unknown";
          const current_quantity = Math.floor(
            Number(materialData?.quantity || 0),
          );
          const new_quantity = Math.max(0, current_quantity - material_consumed);

          console.log(
            `Material: ${material_name}, before: ${current_quantity}, after: ${new_quantity}, consumed: ${material_consumed}`,
          );

          // Actualizar la cantidad del material
          const { error: updateMaterialError } = await supabase
            .from("materials")
            .update({
              quantity: new_quantity,
              last_updated: timestamp,
            })
            .eq("id", material_id);

          if (updateMaterialError) {
            console.error(
              `Error updating material ${material_id}:`,
              updateMaterialError,
            );
            continue;
          }

          console.log(`Material ${material_name} quantity updated successfully`);

          // Registrar el movimiento de producción para el material
          const { error: movementError } = await supabase
            .from("inventory_movements")
            .insert({
              type: "produccion",
              item_type: "material",
              item_id: material_id,
              item_name: material_name,
              quantity_before: current_quantity,
              quantity_after: new_quantity,
              quantity_changed: -material_consumed, // Negativo porque es un descuento
              reason: `Material consumed in production of ${item_name}`,
              reference_code: reference_code || null,
              created_by: created_by || null,
            });

          if (movementError) {
            console.error(
              `Error creating material movement for ${material_name}:`,
              movementError,
            );
          } else {
            console.log(`Material movement recorded for ${material_name}`);
          }
        }
      } else {
        console.log(`No recipes found for product ${item_id}`);
      }
    }

    // Luego, registrar el movimiento en inventory_movements
    const { data, error } = await supabase
      .from("inventory_movements")
      .insert({
        type,
        item_type,
        item_id,
        item_name,
        quantity_before: qty_before,
        quantity_after,
        quantity_changed: qty_changed,
        reason: reason || null,
        reference_code: reference_code || null,
        created_by: created_by || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating movement:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Movement created successfully:", data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/inventory/movements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
