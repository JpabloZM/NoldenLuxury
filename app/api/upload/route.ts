import { supabase } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("Archivo recibido:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Crear nombre único para el archivo
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const bytes = await file.arrayBuffer();

    console.log("Intentando subir a bucket 'product-images'...");

    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, bytes, {
        contentType: file.type,
      });

    if (error) {
      console.error("Error de Supabase Storage:", {
        message: error.message,
        statusCode: (error as any).statusCode,
      });
      return NextResponse.json(
        { error: `Storage error: ${error.message}` },
        { status: 500 },
      );
    }

    console.log("Archivo subido exitosamente:", data);

    // Obtener URL pública
    const { data: publicData } = supabase.storage
      .from("product-images")
      .getPublicUrl(data.path);

    console.log("URL pública generada:", publicData.publicUrl);

    return NextResponse.json({
      url: publicData.publicUrl,
      path: data.path,
    });
  } catch (err: any) {
    console.error("Error en API de upload:", {
      message: err.message,
      stack: err.stack,
    });
    return NextResponse.json(
      { error: `Upload error: ${err.message}` },
      { status: 500 },
    );
  }
}
