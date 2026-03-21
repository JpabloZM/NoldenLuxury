import { supabase } from "@/app/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET - Obtener todos los materiales
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Error fetching materials:", err);
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 },
    );
  }
}

// POST - Crear nuevo material
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("POST /api/materials - Request body:", body);
    const { name, quantity, unit, min_quantity, cost_per_unit, supplier } =
      body;

    if (!name || quantity === undefined || !unit) {
      console.warn("Missing required fields:", { name, quantity, unit });
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, quantity, and unit are required",
        },
        { status: 400 },
      );
    }

    console.log("Inserting material:", { name, quantity, unit, min_quantity });

    const { data, error } = await supabase
      .from("materials")
      .insert([
        {
          name,
          quantity,
          unit,
          min_quantity: min_quantity || 50,
          cost_per_unit: cost_per_unit || null,
          supplier: supplier || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Material created:", data);

    // Registrar movimiento de inventario (entrada) automáticamente
    if (data && data.id && quantity > 0) {
      const { error: movementError } = await supabase
        .from("inventory_movements")
        .insert([
          {
            material_id: data.id,
            type: "entrada",
            quantity_moved: quantity,
            notes: `Material creado: ${name}`,
            reference_code: `MAT-${data.id}`,
          },
        ]);

      if (movementError) {
        console.error("Error registering inventory movement:", movementError);
        // No retornamos error aquí porque el material ya fue creado
        // Solo registramos el error en los logs
      }
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Error creating material:", err);
    console.error(
      "Error details:",
      err instanceof Error ? err.message : String(err),
    );
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to create material",
      },
      { status: 500 },
    );
  }
}
