import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    console.log("Starting cleanup of inventory movements...");

    // Obtener cantidad antes de limpiar
    const { data: before } = await supabase
      .from("inventory_movements")
      .select("id", { count: "exact", head: true });

    const beforeCount = before?.length || 0;
    console.log(`Found ${beforeCount} movements to delete`);

    // Limpiar todos los movimientos
    const { error } = await supabase
      .from("inventory_movements")
      .delete()
      .neq("id", ""); // neq = not equal, elimina todos (ya que ningún id es vacío)

    if (error) {
      console.error("Error deleting movements:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Verificar que se borraron
    const { data: after } = await supabase
      .from("inventory_movements")
      .select("id", { count: "exact", head: true });

    const afterCount = after?.length || 0;
    console.log(
      `Cleanup complete. Deleted: ${beforeCount - afterCount} movements`,
    );

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${beforeCount - afterCount} movements`,
      before: beforeCount,
      after: afterCount,
    });
  } catch (error) {
    console.error("Error in cleanup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
