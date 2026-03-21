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

export async function GET() {
  try {
    const { data: recipes, error } = await supabase
      .from("product_recipes")
      .select("id, product_id, material_id, quantity_needed");

    if (error) {
      console.error("Error fetching recipes:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(recipes || [], { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/debug/recipes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
