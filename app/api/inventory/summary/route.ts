import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Obtener resumen consolidado del inventario
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/inventory/summary - Fetching inventory summary');

    // Contar materiales
    const { data: materialsData, error: materialsError } = await supabase
      .from('materials')
      .select('id, quantity, min_quantity', { count: 'exact' });

    if (materialsError) {
      console.error('Error fetching materials:', materialsError);
      return NextResponse.json(
        { error: materialsError.message },
        { status: 500 }
      );
    }

    // Contar productos
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id, inventory', { count: 'exact' });

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return NextResponse.json(
        { error: productsError.message },
        { status: 500 }
      );
    }

    // Contar materiales con bajo stock
    const materialsLowStock = (materialsData || []).filter(
      (m) => m.quantity < m.min_quantity
    ).length;

    // Contar productos con bajo stock (umbral de 5)
    const productsLowStock = (productsData || []).filter(
      (p) => (p.inventory || 0) < 5
    ).length;

    // Obtener movimientos recientes
    const { data: recentMovements, error: movementsError } = await supabase
      .from('inventory_movements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (movementsError) {
      console.error('Error fetching movements:', movementsError);
      return NextResponse.json(
        { error: movementsError.message },
        { status: 500 }
      );
    }

    const summary = {
      total_materials: materialsData?.length || 0,
      total_products: productsData?.length || 0,
      materials_low_stock: materialsLowStock,
      products_low_stock: productsLowStock,
      recent_movements: recentMovements || [],
      total_movement_value: 0, // Puedes calcular esto con cost_per_unit si lo necesitas
    };

    console.log('Summary calculated:', summary);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error in GET /api/inventory/summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
