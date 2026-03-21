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
