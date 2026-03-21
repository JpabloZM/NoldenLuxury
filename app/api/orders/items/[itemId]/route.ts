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

// PATCH - Actualizar item de orden
export async function PATCH(
  request: NextRequest,
  { params }: { params: { itemId: string } },
) {
  try {
    const itemId = params.itemId;
    const body = await request.json();

    const { data: currentItem, error: fetchError } = await supabase
      .from("order_items")
      .select("*")
      .eq("id", itemId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const updates: any = {};
    if (body.quantity) updates.quantity = body.quantity;
    if (body.unit_price) updates.unit_price = body.unit_price;

    if (updates.quantity || updates.unit_price) {
      const quantity = updates.quantity || currentItem.quantity;
      const unit_price = updates.unit_price || currentItem.unit_price;
      updates.subtotal = quantity * unit_price;
    }

    const { data, error } = await supabase
      .from("order_items")
      .update(updates)
      .eq("id", itemId)
      .select()
      .single();

    if (error) {
      console.error("Error updating order item:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Actualizar total de la orden
    const { data: items } = await supabase
      .from("order_items")
      .select("subtotal")
      .eq("order_id", currentItem.order_id);

    const total_amount = (items || []).reduce(
      (sum: number, item: any) => sum + item.subtotal,
      0,
    );

    await supabase
      .from("orders")
      .update({ total_amount })
      .eq("id", currentItem.order_id);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in PATCH /api/orders/items/[itemId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Eliminar item de orden
export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } },
) {
  try {
    const itemId = params.itemId;

    const { data: item, error: fetchError } = await supabase
      .from("order_items")
      .select("*")
      .eq("id", itemId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const { error: deleteError } = await supabase
      .from("order_items")
      .delete()
      .eq("id", itemId);

    if (deleteError) {
      console.error("Error deleting order item:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Actualizar total de la orden
    const { data: items } = await supabase
      .from("order_items")
      .select("subtotal")
      .eq("order_id", item.order_id);

    const total_amount = (items || []).reduce(
      (sum: number, itemData: any) => sum + itemData.subtotal,
      0,
    );

    await supabase
      .from("orders")
      .update({ total_amount })
      .eq("id", item.order_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/orders/items/[itemId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
