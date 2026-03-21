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

// POST - Agregar item a orden
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: orderId } = await params;
    const body = await request.json();
    const { product_id, quantity, unit_price } = body;

    if (!product_id || !quantity || !unit_price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const subtotal = quantity * unit_price;

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("name")
      .eq("id", product_id)
      .single();

    if (productError) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("order_items")
      .insert({
        order_id: orderId,
        product_id,
        quantity,
        unit_price,
        subtotal,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding order item:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Actualizar total de la orden
    const { data: items } = await supabase
      .from("order_items")
      .select("subtotal")
      .eq("order_id", orderId);

    const total_amount = (items || []).reduce(
      (sum: number, item: any) => sum + item.subtotal,
      0,
    );

    await supabase.from("orders").update({ total_amount }).eq("id", orderId);

    return NextResponse.json({
      id: data.id,
      order_id: data.order_id,
      product_id: data.product_id,
      product_name: product.name,
      quantity: data.quantity,
      unit_price: data.unit_price,
      subtotal: data.subtotal,
      created_at: data.created_at,
      updated_at: data.updated_at,
    });
  } catch (error) {
    console.error("Error in POST /api/orders/[id]/items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
