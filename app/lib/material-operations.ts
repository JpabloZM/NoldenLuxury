import type { Material, MaterialForm } from "./material-types";

// Obtener todos los materiales
export async function fetchMaterials(): Promise<Material[]> {
  try {
    const response = await fetch("/api/materials", {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Error fetching materials");
      return [];
    }

    return await response.json();
  } catch (err) {
    console.error("Error in fetchMaterials:", err);
    return [];
  }
}

// Crear nuevo material
export async function createMaterial(
  data: MaterialForm,
): Promise<Material | null> {
  try {
    console.log("Creating material:", data);
    const response = await fetch("/api/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    console.log("Response status:", response.status);
    console.log("Response OK:", response.ok);
    console.log("Response headers:", response.headers);

    if (!response.ok) {
      const responseText = await response.text();
      console.error("Response text:", responseText);

      try {
        const error = JSON.parse(responseText);
        console.error("Error response:", error);
      } catch (e) {
        console.error("Could not parse error response");
      }
      return null;
    }

    const result = await response.json();
    console.log("Material created successfully:", result);
    return result;
  } catch (err) {
    console.error("Error in createMaterial:", err);
    console.error("Error type:", err instanceof Error ? err.name : typeof err);
    console.error(
      "Error message:",
      err instanceof Error ? err.message : String(err),
    );
    console.error("Error stack:", err instanceof Error ? err.stack : "N/A");
    return null;
  }
}

// Actualizar material
export async function updateMaterial(
  id: string,
  data: Partial<MaterialForm>,
): Promise<Material | null> {
  try {
    const response = await fetch(`/api/materials/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = "Unknown error";
      try {
        const error = await response.json();
        errorMessage = error.error || JSON.stringify(error);
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      console.error("Error updating material:", errorMessage);
      return null;
    }

    return await response.json();
  } catch (err) {
    console.error("Error in updateMaterial:", err instanceof Error ? err.message : String(err));
    return null;
  }
}

// Eliminar material
export async function deleteMaterial(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/materials/${id}`, {
      method: "DELETE",
    });

    return response.ok;
  } catch (err) {
    console.error("Error in deleteMaterial:", err);
    return false;
  }
}

// Actualizar solo la cantidad
export async function updateMaterialQuantity(
  id: string,
  quantity: number,
): Promise<Material | null> {
  return updateMaterial(id, { quantity });
}
