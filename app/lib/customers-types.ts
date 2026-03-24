// Tipos para Sistema de Clientes

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  source: "manual" | "registered";
  created_at: string;
  updated_at: string;
}

export interface CustomerForm {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  source?: "manual" | "registered";
}

export interface CustomerWithOrderCount extends Customer {
  order_count?: number;
  total_spent?: number;
}
