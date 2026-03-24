import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

let supabase: any;
try {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
} catch (err) {
  console.error("Failed to create Supabase client:", err);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    const body = await request.json();

    // Obtener el producto actual para comparar inventario
    const { data: currentProduct, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const currentInventory = currentProduct.inventory || 0;
    const newInventory =
      body.inventory !== undefined ? body.inventory : currentInventory;
    const inventoryChanged = newInventory - currentInventory;
    const timestamp = new Date().toISOString();

    // Si hay cambio en el inventario, procesar descuento de materiales
    if (inventoryChanged !== 0 && inventoryChanged > 0) {
      console.log(
        `Product ${id} inventory increased by ${inventoryChanged}. Processing material discount.`,
      );

      try {
        // 1. Obtener la receta del producto (materiales necesarios)
        const { data: recipes, error: recipesError } = await supabase
          .from("product_recipes")
          .select("id, material_id, quantity_needed, unit")
          .eq("product_id", id);

        if (recipesError) {
          console.error("Error fetching recipes:", recipesError);
          // Si no hay receta, solo actualizar el producto sin descuentos
        } else if (recipes && recipes.length > 0) {
          console.log(`Found ${recipes.length} materials for this product`);

          // 2. Para cada material en la receta, descontar la cantidad usada
          for (const recipe of recipes) {
            const material_id = recipe.material_id;
            const quantity_per_unit = Math.floor(
              Number(recipe.quantity_needed),
            );
            const material_consumed = quantity_per_unit * inventoryChanged;

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
              console.error(
                `Error fetching material ${material_id}:`,
                materialError,
              );
              continue;
            }

            const material_name = materialData?.name || "unknown";
            const current_quantity = Math.floor(
              Number(materialData?.quantity || 0),
            );
            const new_quantity = Math.max(
              0,
              current_quantity - material_consumed,
            );

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

            console.log(
              `Material ${material_name} quantity updated successfully`,
            );

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
                quantity_changed: -material_consumed,
                reason: `Material consumed in production of ${currentProduct.name} (Manual: +${inventoryChanged} units)`,
                reference_code: id,
                created_by: "MANUAL_EDIT",
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
          console.log(
            `No recipes found for product ${id} - inventory will be updated without material discount`,
          );
        }
      } catch (err) {
        console.error("Error processing material discount:", err);
        // No retornamos error aquí porque el producto debe actualizarse de todas formas
      }
    }

    // 3. Actualizar el producto
    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update({
        ...(body.name && { name: body.name }),
        ...(body.category && { category: body.category }),
        ...(body.material && { material: body.material }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.image && { image: body.image }),
        ...(body.inventory !== undefined && { inventory: body.inventory }),
        updated_at: timestamp,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 4. Registrar movimiento del producto (solo si hay cambio de inventario)
    if (inventoryChanged !== 0) {
      const movementType = inventoryChanged > 0 ? "produccion" : "salida";

      const { error: productMovementError } = await supabase
        .from("inventory_movements")
        .insert({
          type: movementType,
          item_type: "product",
          item_id: id,
          item_name: currentProduct.name,
          quantity_before: currentInventory,
          quantity_after: newInventory,
          quantity_changed: inventoryChanged,
          reason: `Movimiento manual: ${movementType === "produccion" ? "Aumento" : "Disminución"} de ${Math.abs(inventoryChanged)} unidades`,
          reference_code: id,
          created_by: "MANUAL_EDIT",
        });

      if (productMovementError) {
        console.error("Error creating product movement:", productMovementError);
      } else {
        console.log(`Product movement recorded for ${currentProduct.name}`);
      }
    }

    return NextResponse.json(updatedProduct);
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    console.log("Deleting product with ID:", id);

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
