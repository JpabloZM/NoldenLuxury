import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Debug
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log("API Route - Supabase Config:", {
      url: url ? "✓" : "✗",
      key: key ? "✓" : "✗",
    });

    if (!url || !key) {
      return NextResponse.json(
        { error: "Supabase configuration missing" },
        { status: 500 },
      );
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: error.message || "Database error" },
        { status: 500 },
      );
    }

    console.log("Products fetched:", data?.length || 0);
    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error("API error:", err?.message || err);
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
