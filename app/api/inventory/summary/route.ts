import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

console.log("Loading inventory/summary route...");
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

// GET - Obtener resumen consolidado del inventario
export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/inventory/summary - Fetching inventory summary");

    // Verificar config
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log("Supabase config:", { url: !!url, key: !!key });

    // Obtener materiales (sin count)
    console.log("Fetching materials...");
    const { data: materialsData, error: materialsError } = await supabase
      .from("materials")
      .select("id, quantity, min_quantity");

    if (materialsError) {
      console.error("Error fetching materials:", materialsError);
      return NextResponse.json(
        { error: `Materials error: ${materialsError.message}` },
        { status: 500 },
      );
    }
    console.log("Materials fetched:", materialsData?.length);

    // Obtener productos (sin count)
    console.log("Fetching products...");
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("id, inventory");

    if (productsError) {
      console.error("Error fetching products:", productsError);
      return NextResponse.json(
        { error: `Products error: ${productsError.message}` },
        { status: 500 },
      );
    }
    console.log("Products fetched:", productsData?.length);

    // Contar materiales con bajo stock
    const materialsLowStock = (materialsData || []).filter(
      (m: any) => m.quantity < m.min_quantity,
    ).length;

    // Contar productos con bajo stock (umbral de 5)
    const productsLowStock = (productsData || []).filter(
      (p: any) => (p.inventory || 0) < 5,
    ).length;

    // Obtener movimientos recientes
    console.log("Fetching recent movements...");
    const { data: recentMovements, error: movementsError } = await supabase
      .from("inventory_movements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (movementsError) {
      console.error("Error fetching movements:", movementsError);
      return NextResponse.json(
        { error: `Movements error: ${movementsError.message}` },
        { status: 500 },
      );
    }
    console.log("Movements fetched:", recentMovements?.length);

    const summary = {
      total_materials: materialsData?.length || 0,
      total_products: productsData?.length || 0,
      materials_low_stock: materialsLowStock,
      products_low_stock: productsLowStock,
      recent_movements: recentMovements || [],
      total_movement_value: 0,
    };

    console.log("Summary calculated:", summary);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error in GET /api/inventory/summary:", error);
    return NextResponse.json(
      { error: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
}
