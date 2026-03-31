import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/app/lib/supabase";

// GET - Obtener todos los clientes o buscar
export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let query = supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`,
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Error fetching customers:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Customers fetched:", data?.length || 0);
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("❌ Error in GET /api/customers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Crear nuevo cliente
export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseServer();
    const body = await request.json();
    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      zip_code,
      notes,
      source = "manual",
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Customer name is required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("customers")
      .insert({
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zip_code: zip_code || null,
        notes: notes || null,
        source,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Error creating customer:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Customer created:", data.name);
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error in POST /api/customers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
