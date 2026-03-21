import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

let supabase: any;
try {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  console.log("Supabase client created for product-recipes");
} catch (err) {
  console.error("Failed to create Supabase client:", err);
}

// POST - Crear una receta de producto (vincular material con cantidad)
export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/product-recipes/create - Creating product recipe");

    const body = await request.json();
    console.log("Request body:", body);

    const { product_id, material_id, quantity_needed } = body;

    // Validación de campos requeridos
    if (!product_id || !material_id || quantity_needed === undefined) {
      console.error("Missing required fields");
      return NextResponse.json(
        {
          error:
            "Missing required fields: product_id, material_id, quantity_needed",
        },
        { status: 400 },
      );
    }

    // Ensure quantity is a number
    const qty = Math.floor(Number(quantity_needed));

    console.log(
      `Creating recipe: product_id: ${product_id}, material_id: ${material_id}, quantity_needed: ${qty}`,
    );

    // Obtener la unidad del material
    const { data: materialData, error: materialError } = await supabase
      .from("materials")
      .select("unit")
      .eq("id", material_id)
      .single();

    if (materialError || !materialData) {
      console.error("Error fetching material:", materialError);
      return NextResponse.json(
        {
          error: `Material not found with ID: ${material_id}`,
          details: materialError,
        },
        { status: 404 },
      );
    }

    const unit = materialData.unit;
    console.log(`Material unit: ${unit}`);

    // Insertar la receta
    const { data, error } = await supabase
      .from("product_recipes")
      .insert({
        product_id,
        material_id,
        quantity_needed: qty,
        unit,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating recipe:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Recipe created successfully:", data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/product-recipes/create:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
