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

// GET - Obtener recetas por producto o todas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");

    let query = supabase.from("product_recipes").select(`
      id,
      product_id,
      material_id,
      quantity_needed,
      unit,
      created_at,
      updated_at,
      materials(name)
    `);

    if (productId) {
      query = query.eq("product_id", productId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching recipes:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mapear datos con el nombre del material
    const recipes = (data || []).map((recipe: any) => ({
      id: recipe.id,
      product_id: recipe.product_id,
      material_id: recipe.material_id,
      material_name: recipe.materials?.name || "Unknown",
      quantity_needed: recipe.quantity_needed,
      unit: recipe.unit,
      created_at: recipe.created_at,
      updated_at: recipe.updated_at,
    }));

    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Error in GET /api/recipes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Crear nueva receta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, material_id, quantity_needed, unit } = body;

    if (!product_id || !material_id || !quantity_needed) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("product_recipes")
      .insert({
        product_id,
        material_id,
        quantity_needed,
        unit: unit || "g",
      })
      .select(
        `
        id,
        product_id,
        material_id,
        quantity_needed,
        unit,
        created_at,
        updated_at,
        materials(name)
      `,
      )
      .single();

    if (error) {
      console.error("Error creating recipe:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      product_id: data.product_id,
      material_id: data.material_id,
      material_name: data.materials?.name,
      quantity_needed: data.quantity_needed,
      unit: data.unit,
      created_at: data.created_at,
      updated_at: data.updated_at,
    });
  } catch (error) {
    console.error("Error in POST /api/recipes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
