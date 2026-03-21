import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// GET - Obtener items consolidados (productos + materiales)
export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/inventory/items - Fetching consolidated items");

    // Verificar config
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log("Supabase config:", { url: !!url, key: !!key });

    // Obtener materiales
    console.log("Fetching materials...");
    const { data: materials, error: materialsError } = await supabase
      .from("materials")
      .select("id, name, quantity, min_quantity, unit, cost_per_unit");

    if (materialsError) {
      console.error("Error fetching materials:", materialsError);
      return NextResponse.json(
        { error: `Materials error: ${materialsError.message}` },
        { status: 500 },
      );
    }
    console.log("Materials fetched:", materials?.length);

    // Obtener productos
    console.log("Fetching products...");
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, inventory, price");

    if (productsError) {
      console.error("Error fetching products:", productsError);
      return NextResponse.json(
        { error: `Products error: ${productsError.message}` },
        { status: 500 },
      );
    }
    console.log("Products fetched:", products?.length);

    // Consolidar items
    const items = [
      ...(materials || []).map((m: any) => ({
        id: m.id,
        name: m.name,
        type: "material" as const,
        quantity: m.quantity,
        min_quantity: m.min_quantity,
        unit: m.unit,
        cost_per_unit: m.cost_per_unit,
        status: (m.quantity < m.min_quantity
          ? "bajo_stock"
          : "normal") as const,
      })),
      ...(products || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        type: "product" as const,
        quantity: p.inventory || 0,
        min_quantity: 5, // Valor por defecto para productos
        unit: "Unidad",
        cost_per_unit: p.price,
        status: ((p.inventory || 0) < 5 ? "bajo_stock" : "normal") as const,
      })),
    ];

    console.log("Items consolidated, total:", items.length);
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error in GET /api/inventory/items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
