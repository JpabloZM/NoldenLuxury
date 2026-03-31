import { supabaseServer } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = supabaseServer();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching products:", error);
      return NextResponse.json(
        { error: error.message || "Database error" },
        { status: 500 },
      );
    }

    console.log("✅ Products fetched:", data?.length || 0);
    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error("❌ API error:", err?.message || err);
    return NextResponse.json(
      {
        error: "Failed to fetch products",
        details: err?.message || String(err),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = supabaseServer();
    const body = await request.json();

    const { data, error } = await supabase
      .from("products")
      .insert({
        name: body.name,
        category: body.category,
        material: body.material,
        price: body.price,
        image: body.image,
        inventory: body.inventory,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Error creating product:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Product created:", data.name);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("❌ API error:", err);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
