import { supabase } from "@/app/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET - Obtener material por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

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
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();

    const { data, error } = await supabase
      .from("materials")
      .update({
        ...body,
        last_updated: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
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
    console.error("Error updating material:", err);
    return NextResponse.json(
      { error: "Failed to update material" },
      { status: 500 },
    );
  }
}

// DELETE - Eliminar material
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

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
