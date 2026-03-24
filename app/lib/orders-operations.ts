import type {
  ProductRecipe,
  ProductRecipeForm,
  Order,
  OrderForm,
  OrderItem,
  OrderItemForm,
  OrderSummary,
} from "./orders-types";

// ============== PRODUCT RECIPES ==============

export async function fetchRecipesByProduct(
  productId: string,
): Promise<ProductRecipe[]> {
  try {
    const response = await fetch(`/api/recipes?product_id=${productId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Error fetching recipes:", response.statusText);
      return [];
    }

    return await response.json();
  } catch (err) {
    console.error("Error in fetchRecipesByProduct:", err);
    return [];
  }
}

export async function createRecipe(
  recipe: ProductRecipeForm,
): Promise<ProductRecipe> {
  const response = await fetch("/api/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recipe),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error creating recipe");
  }

  return await response.json();
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  const response = await fetch(`/api/recipes/${recipeId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error deleting recipe");
  }
}

// ============== ORDERS ==============

export async function fetchOrders(): Promise<Order[]> {
  try {
    const response = await fetch("/api/orders", {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Error fetching orders:", response.statusText);
      return [];
    }

    return await response.json();
  } catch (err) {
    console.error("Error in fetchOrders:", err);
    return [];
  }
}

export async function fetchOrderById(
  orderId: string,
): Promise<OrderSummary | null> {
  try {
    const response = await fetch(`/api/orders/${orderId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Error fetching order:", response.statusText);
      return null;
    }

    return await response.json();
  } catch (err) {
    console.error("Error in fetchOrderById:", err);
    return null;
  }
}

export async function createOrder(order: OrderForm): Promise<Order> {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error creating order");
  }

  return await response.json();
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<Order> {
  const response = await fetch(`/api/orders/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      status,
      confirm: status === "confirmed" // Descontar productos si se confirma
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error updating order status");
  }

  return await response.json();
}

// ============== ORDER ITEMS ==============

export async function addOrderItem(
  orderId: string,
  item: OrderItemForm,
): Promise<OrderItem> {
  const response = await fetch(`/api/orders/${orderId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error adding order item");
  }

  return await response.json();
}

export async function removeOrderItem(itemId: string): Promise<void> {
  const response = await fetch(`/api/orders/items/${itemId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error removing order item");
  }
}

export async function updateOrderItem(
  itemId: string,
  item: Partial<OrderItemForm>,
): Promise<OrderItem> {
  const response = await fetch(`/api/orders/items/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error updating order item");
  }

  return await response.json();
}
