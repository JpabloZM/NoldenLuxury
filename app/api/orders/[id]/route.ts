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

// GET - Obtener orden con items y movimientos
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: orderId } = await params;

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError) {
      console.error("Error fetching order:", orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    const { data: itemsData, error: itemsError } = await supabase
      .from("order_items")
      .select(
        `
        id,
        order_id,
        product_id,
        quantity,
        unit_price,
        subtotal,
        created_at,
        updated_at,
        products(name)
      `,
      )
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    const { data: movementsData, error: movementsError } = await supabase
      .from("order_movements")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    if (movementsError) {
      console.error("Error fetching order movements:", movementsError);
      return NextResponse.json(
        { error: movementsError.message },
        { status: 500 },
      );
    }

    const items = (itemsData || []).map((item: any) => ({
      id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      product_name: item.products?.name || "Unknown",
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    return NextResponse.json({
      ...orderData,
      items,
      movements: movementsData || [],
      item_count: items.length,
    });
  } catch (error) {
    console.error("Error in GET /api/orders/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH - Actualizar estado de orden (con automatización)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: orderId } = await params;
    const body = await request.json();
    const { status, confirm = false } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 },
      );
    }

    // Obtener orden actual
    const { data: currentOrder, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Si confirmamos (cambiar a "confirmed"), descontar productos
    if (
      confirm &&
      status === "confirmed" &&
      currentOrder.status !== "confirmed"
    ) {
      // Obtener items de la orden
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (itemsError) {
        return NextResponse.json(
          { error: itemsError.message },
          { status: 500 },
        );
      }

      // Descontar cada producto del inventario y registrar movimiento
      for (const item of items || []) {
        // Obtener producto actual
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", item.product_id)
          .single();

        if (productError) continue;

        const quantity_before = product.inventory || 0;
        const quantity_changed = -item.quantity; // Negativo porque es salida
        const quantity_after = quantity_before + quantity_changed;

        // Actualizar inventario de producto
        await supabase
          .from("products")
          .update({ inventory: quantity_after })
          .eq("id", item.product_id);

        // Registrar movimiento automático
        await supabase.from("inventory_movements").insert({
          type: "salida",
          item_type: "product",
          item_id: item.product_id,
          item_name: product.name,
          quantity_before,
          quantity_after,
          quantity_changed,
          reason: `Orden confirmada: ${currentOrder.order_number}`,
          reference_code: currentOrder.order_number,
          created_by: "SISTEMA_AUTOMATICO",
        });
      }
    }

    // Actualizar orden
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Registrar movimiento
    await supabase.from("order_movements").insert({
      order_id: orderId,
      status,
      reason: confirm
        ? "Orden confirmada y productos descontados"
        : `Estado actualizado a ${status}`,
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error in PATCH /api/orders/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
