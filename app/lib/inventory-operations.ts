import {
  InventoryMovement,
  InventoryMovementForm,
  InventorySummary,
  InventoryItem,
} from "./inventory-types";

// Obtener todos los movimientos de inventario
export async function fetchMovements(
  limit: number = 100,
): Promise<InventoryMovement[]> {
  try {
    console.log("Fetching inventory movements");
    const response = await fetch(`/api/inventory/movements?limit=${limit}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch movements: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Movements fetched:", data);
    return data;
  } catch (error) {
    console.error("Error fetching movements:", error);
    throw error;
  }
}

// Crear nuevo movimiento de inventario
export async function createMovement(
  data: InventoryMovementForm,
): Promise<InventoryMovement> {
  try {
    console.log("Creating inventory movement:", data);
    const response = await fetch("/api/inventory/movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    console.log("Response status:", response.status);
    const responseData = await response.json();
    console.log("Response data:", responseData);

    if (!response.ok) {
      console.error("Error response:", responseData);
      throw new Error(responseData.error || "Failed to create movement");
    }

    console.log("Movement created successfully:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error creating movement:", error);
    throw error;
  }
}

// Obtener resumen consolidado de inventario
export async function fetchInventorySummary(): Promise<InventorySummary> {
  try {
    console.log("Fetching inventory summary");
    const response = await fetch("/api/inventory/summary", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch summary: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Summary fetched:", data);
    return data;
  } catch (error) {
    console.error("Error fetching summary:", error);
    throw error;
  }
}

// Obtener items consolidados de inventario (productos + materiales)
export async function fetchInventoryItems(): Promise<InventoryItem[]> {
  try {
    console.log("Fetching inventory items");
    const response = await fetch("/api/inventory/items", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch items: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Items fetched:", data);
    return data;
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }
}

// Registrar movimiento de material
export async function recordMaterialMovement(
  materialId: string,
  materialName: string,
  quantityBefore: number,
  quantityChanged: number,
  type: "entrada" | "salida" | "ajuste" = "ajuste",
  reason?: string,
): Promise<InventoryMovement> {
  return createMovement({
    type,
    item_type: "material",
    item_id: materialId,
    item_name: materialName,
    quantity_before: quantityBefore,
    quantity_changed: quantityChanged,
    reason,
  });
}

// Registrar movimiento de producto
export async function recordProductMovement(
  productId: string,
  productName: string,
  quantityBefore: number,
  quantityChanged: number,
  type: "entrada" | "salida" | "ajuste" | "produccion" = "ajuste",
  reason?: string,
): Promise<InventoryMovement> {
  return createMovement({
    type,
    item_type: "product",
    item_id: productId,
    item_name: productName,
    quantity_before: quantityBefore,
    quantity_changed: quantityChanged,
    reason,
  });
}
