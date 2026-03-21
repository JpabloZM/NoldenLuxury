import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

let supabase: any;
try {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
} catch (err) {
  console.error("Failed to create Supabase client:", err);
}

// POST - Registrar producción (descuenta materiales y crea recetas)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, product_name, quantity_produced, materials_used } =
      body;

    if (!product_id || !product_name || !quantity_produced || !materials_used) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    console.log("Registering production:", {
      product_id,
      product_name,
      quantity_produced,
      materials_used_count: materials_used.length,
    });

    // Por cada material usado: descontar y registrar movimiento
    for (const material of materials_used) {
      const { material_id, material_name, quantity_used } = material;

      // Obtener material actual
      const { data: materialData, error: fetchError } = await supabase
        .from("materials")
        .select("quantity")
        .eq("id", material_id)
        .single();

      if (fetchError) {
        console.error(`Error fetching material ${material_id}:`, fetchError);
        continue;
      }

      const quantity_before = materialData?.quantity || 0;
      const quantity_changed = -quantity_used; // Negativo porque se descuenta
      const quantity_after = quantity_before + quantity_changed;

      // Actualizar cantidad de material
      const { error: updateError } = await supabase
        .from("materials")
        .update({ quantity: quantity_after })
        .eq("id", material_id);

      if (updateError) {
        console.error(`Error updating material ${material_id}:`, updateError);
        continue;
      }

      // Registrar movimiento de inventario
      const { error: movementError } = await supabase
        .from("inventory_movements")
        .insert({
          type: "produccion",
          item_type: "material",
          item_id: material_id,
          item_name: material_name,
          quantity_before,
          quantity_after,
          quantity_changed,
          reason: `Producción: ${product_name} x${quantity_produced}`,
          reference_code: product_id,
          created_by: "SISTEMA_PRODUCCION",
        });

      if (movementError) {
        console.error(
          `Error creating movement for material ${material_id}:`,
          movementError,
        );
      }

      // Crear receta (product_recipe)
      const { error: recipeError } = await supabase
        .from("product_recipes")
        .upsert({
          product_id,
          material_id,
          quantity_per_unit: quantity_used / quantity_produced, // Cantidad por unidad producida
          unit: material.unit || "g", // Usar la unidad del material
          created_at: new Date().toISOString(),
        });

      if (recipeError) {
        console.error(
          `Error creating recipe for product ${product_id}:`,
          recipeError,
        );
      } else {
        console.log(`Recipe created for ${product_id}: ${quantity_used / quantity_produced}${material.unit || "g"} per unit`);
      }
    }

    // Registrar movimiento DEL PRODUCTO (entrada)
    const { error: productMovementError } = await supabase
      .from("inventory_movements")
      .insert({
        type: "produccion",
        item_type: "product",
        item_id: product_id,
        item_name: product_name,
        quantity_before: 0,
        quantity_after: quantity_produced,
        quantity_changed: quantity_produced,
        reason: `Producción: ${product_name} creado`,
        reference_code: product_id,
        created_by: "SISTEMA_PRODUCCION",
      });

    if (productMovementError) {
      console.error(
        "Error creating product movement:",
        productMovementError,
      );
    }

    console.log("Production registered successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/products/register-production:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
