// Tipos para Sistema de Recetas y Órdenes

// RECETAS DE PRODUCTOS
export interface ProductRecipe {
  id: string;
  product_id: string;
  material_id: string;
  material_name: string;
  quantity_needed: number;
  unit: string;
  created_at: string;
  updated_at: string;
}

export interface ProductRecipeForm {
  product_id: string;
  material_id: string;
  quantity_needed: number;
  unit: string;
}

// ÓRDENES / PEDIDOS
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  status: OrderStatus;
  total_amount?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderForm {
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  status?: OrderStatus;
  notes?: string;
}

// ITEMS DE ÓRDENES
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItemForm {
  product_id: string;
  quantity: number;
  unit_price: number;
}

// MOVIMIENTOS DE ÓRDENES (Historial)
export interface OrderMovement {
  id: string;
  order_id: string;
  status: OrderStatus;
  reason?: string;
  created_at: string;
}

// RESUMEN DE ORDEN
export interface OrderSummary extends Order {
  items: OrderItem[];
  movements: OrderMovement[];
  item_count: number;
}
