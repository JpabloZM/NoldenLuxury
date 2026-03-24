export type AdminUser = {
  id: string;
  email: string;
  password: string; // En producción: usar hash
};

export type Cliente = {
  id: string;
  nombre: string;
  email: string;
  password: string; // En producción: usar hash
  telefono?: string;
  ciudad?: string;
  direccionEntrega?: string;
  codigoPostal?: string;
  createdAt: string;
};

export type CarritoItem = {
  productId: string;
  productName: string;
  category:
    | "Anillos"
    | "Collares"
    | "Arete"
    | "Pulseras"
    | "Tobilleras"
    | "Dijes";
  material: "Oro Laminado 18K" | "Plata 925";
  price: number;
  quantity: number;
  image: string;
};

export type ProductWithInventory = {
  id: string;
  name: string;
  category:
    | "Anillos"
    | "Collares"
    | "Arete"
    | "Pulseras"
    | "Tobilleras"
    | "Dijes";
  material: "Oro Laminado 18K" | "Plata 925";
  price: number;
  image: string;
  inventory: number;
  createdAt: string;
  updatedAt: string;
};

export type Material = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id: string;
  clienteId: string;
  customerName: string;
  customerEmail: string;
  items: CarritoItem[];
  totalPrice: number;
  status: "Pendiente" | "Confirmado" | "Enviado" | "Entregado" | "Cancelado";
  createdAt: string;
  notes?: string;
};

export type Contact = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: "No leído" | "Leído" | "Respondido";
  createdAt: string;
};

export type DashboardStats = {
  totalProducts: number;
  totalOrders: number;
  totalContacts: number;
  lowInventoryItems: number;
  pendingOrders: number;
};
