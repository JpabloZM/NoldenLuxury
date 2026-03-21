// Tipos para el sistema de inventario completo

export type MovementType = 'entrada' | 'salida' | 'ajuste' | 'produccion';
export type ItemType = 'material' | 'product';

export interface InventoryMovement {
  id: string;
  type: MovementType;
  item_type: ItemType;
  item_id: string;
  item_name: string;
  quantity_before: number;
  quantity_after: number;
  quantity_changed: number;
  reason?: string;
  reference_code?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovementForm {
  type: MovementType;
  item_type: ItemType;
  item_id: string;
  item_name: string;
  quantity_before: number;
  quantity_changed: number;
  reason?: string;
  reference_code?: string;
  created_by?: string;
}

export interface InventorySummary {
  total_materials: number;
  total_products: number;
  materials_low_stock: number;
  products_low_stock: number;
  recent_movements: InventoryMovement[];
  total_movement_value: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: ItemType;
  quantity: number;
  min_quantity: number;
  unit?: string;
  cost_per_unit?: number;
  status: 'normal' | 'bajo_stock';
}
