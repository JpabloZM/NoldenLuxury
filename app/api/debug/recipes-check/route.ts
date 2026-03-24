import { NextResponse } from "next/server";
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

// GET - Debug: Ver todas las recetas y sus valores
export async function GET() {
  try {
    const { data: recipes, error: recipesError } = await supabase
      .from("product_recipes")
      .select(`
        id,
        product_id,
        material_id,
        quantity_needed,
        unit,
        created_at,
        products(name),
        materials(name)
      `);

    if (recipesError) {
      return NextResponse.json({ error: recipesError.message }, { status: 500 });
    }

    // Mapear para que sea más legible
    const mappedRecipes = recipes.map((recipe: any) => ({
      product_name: recipe.products?.name || "Unknown",
      material_name: recipe.materials?.name || "Unknown",
      quantity_needed: recipe.quantity_needed,
      unit: recipe.unit,
      recipe_id: recipe.id,
    }));

    return NextResponse.json({
      total_recipes: mappedRecipes.length,
      recipes: mappedRecipes,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 },
    );
  }
}
