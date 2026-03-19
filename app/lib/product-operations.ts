import type { ProductWithInventory } from "./admin-types";

// Obtener todos los productos
export async function fetchProducts(): Promise<ProductWithInventory[]> {
  try {
    const response = await fetch("/api/products", {
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching products:", errorData.error);
      return [];
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.warn("No data returned from products API");
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      material: item.material,
      price: item.price,
      image: item.image,
      inventory: item.inventory,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  } catch (err) {
    console.error("Unexpected error in fetchProducts:", err);
    return [];
  }
}

// Obtener un producto por ID
export async function fetchProductById(
  id: string
): Promise<ProductWithInventory | null> {
  try {
    const response = await fetch(`/api/products/${id}`);

    if (!response.ok) {
      console.error("Error fetching product");
      return null;
    }

    const data = await response.json();

    return {
      id: data.id,
      name: data.name,
      category: data.category,
      material: data.material,
      price: data.price,
      image: data.image,
      inventory: data.inventory,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (err) {
    console.error("Error fetching product:", err);
    return null;
  }
}

// Crear un nuevo producto
export async function createProduct(
  product: Omit<ProductWithInventory, "id" | "createdAt" | "updatedAt">
): Promise<ProductWithInventory | null> {
  try {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error creating product:", errorData.error);
      return null;
    }

    const data = await response.json();

    return {
      id: data.id,
      name: data.name,
      category: data.category,
      material: data.material,
      price: data.price,
      image: data.image,
      inventory: data.inventory,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (err) {
    console.error("Error creating product:", err);
    return null;
  }
}

// Actualizar un producto
export async function updateProduct(
  id: string,
  product: Partial<Omit<ProductWithInventory, "id" | "createdAt" | "updatedAt">>
): Promise<ProductWithInventory | null> {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error updating product:", errorData.error);
      return null;
    }

    const data = await response.json();

    return {
      id: data.id,
      name: data.name,
      category: data.category,
      material: data.material,
      price: data.price,
      image: data.image,
      inventory: data.inventory,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (err) {
    console.error("Error updating product:", err);
    return null;
  }
}

// Eliminar un producto
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error deleting product:", errorData.error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error deleting product:", err);
    return false;
  }
}

// Obtener productos con bajo inventario
export async function fetchLowInventoryProducts(
  threshold: number = 5
): Promise<ProductWithInventory[]> {
  try {
    const products = await fetchProducts();
    return products.filter((p) => p.inventory < threshold);
  } catch (err) {
    console.error("Error fetching low inventory products:", err);
    return [];
  }
}
