import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST() {
  return cleanupDatabase();
}

export async function GET() {
  return cleanupDatabase();
}

async function cleanupDatabase() {
  try {
    console.log("🗑️ STARTING FULL DATABASE CLEANUP...");

    const results: Record<string, any> = {};
    const tablesToClean = [
      "order_movements",
      "order_items",
      "orders",
      "inventory_movements",
      "product_recipes",
      "products",
      "materials",
    ];

    for (const table of tablesToClean) {
      try {
        console.log(`\n📋 Attempting to clean: ${table}`);

        // Contar antes
        const { data: beforeData, error: beforeError } = await supabase
          .from(table)
          .select("id");

        console.log(`   Count before: ${beforeData?.length || 0}`);
        if (beforeError) {
          console.error(`   ❌ Error counting: ${beforeError.message}`);
        }

        // Intentar borrar TODO
        console.log(`   🔄 Attempting DELETE...`);
        const {
          data: deleteData,
          error: deleteError,
          status,
        } = await supabase.from(table).delete().neq("id", "");

        console.log(`   Status: ${status}`);
        if (deleteError) {
          console.error(`   ❌ DELETE ERROR: ${deleteError.message}`);
          console.error(`   Code: ${deleteError.code}`);
          console.error(`   Details:`, deleteError);
        }

        // Contar después
        const { data: afterData, error: afterError } = await supabase
          .from(table)
          .select("id");

        console.log(`   Count after: ${afterData?.length || 0}`);

        results[table] = {
          before: beforeData?.length || 0,
          after: afterData?.length || 0,
          error: deleteError?.message || null,
        };
      } catch (tableError: any) {
        console.error(`   💥 Exception in ${table}:`, tableError.message);
        results[table] = { error: tableError.message };
      }
    }

    console.log("\n🎉 CLEANUP COMPLETE!");
    console.log("Results:", JSON.stringify(results, null, 2));

    return NextResponse.json(
      { success: true, message: "Cleanup finished", results },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("💥 FATAL ERROR in cleanup:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
