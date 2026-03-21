export type Material = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  cost_per_unit?: number;
  supplier?: string;
  last_updated: string;
  created_at: string;
};

export type MaterialForm = {
  name: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  cost_per_unit?: number;
  supplier?: string;
};
