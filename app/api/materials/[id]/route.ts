import { supabase } from "@/app/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET - Obtener material por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching material:", err);
    return NextResponse.json(
      { error: "Failed to fetch material" },
      { status: 500 },
    );
  }
}

// PUT - Actualizar material
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    console.log("PUT /api/materials/[id] - ID:", id);

    // Validar que el ID sea válido
    if (!id) {
      console.error("Invalid material ID:", id);
      return NextResponse.json(
        { error: "Invalid material ID provided" },
        { status: 400 },
      );
    }

    const body = await request.json();
    console.log("PUT request body:", body);

    // Solo permitir actualizar estos campos
    const allowedFields = [
      "name",
      "quantity",
      "unit",
      "min_quantity",
      "cost_per_unit",
      "supplier",
    ];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // Agregar timestamp de actualización
    updateData.last_updated = new Date().toISOString();

    console.log("Updating material ID:", id, "with data:", updateData);

    const { data, error } = await supabase
      .from("materials")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 },
      );
    }

    if (!data) {
      console.warn("Material not found for ID:", id);
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 },
      );
    }

    console.log("Material updated successfully:", data);
    return NextResponse.json(data);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : String(err);
    console.error("Error updating material:", errorMessage);
    return NextResponse.json(
      { error: `Server error: ${errorMessage}` },
      { status: 500 },
    );
  }
}

// DELETE - Eliminar material
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { error } = await supabase.from("materials").delete().eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting material:", err);
    return NextResponse.json(
      { error: "Failed to delete material" },
      { status: 500 },
    );
  }
}
