import type { Customer, CustomerForm } from "./customers-types";

// Obtener todos los clientes
export async function fetchCustomers(): Promise<Customer[]> {
  try {
    const response = await fetch("/api/customers", {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Error fetching customers:", response.statusText);
      return [];
    }

    return await response.json();
  } catch (err) {
    console.error("Error in fetchCustomers:", err);
    return [];
  }
}

// Obtener cliente por ID
export async function fetchCustomerById(id: string): Promise<Customer | null> {
  try {
    const response = await fetch(`/api/customers/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Error fetching customer:", response.statusText);
      return null;
    }

    return await response.json();
  } catch (err) {
    console.error("Error in fetchCustomerById:", err);
    return null;
  }
}

// Buscar clientes por nombre
export async function searchCustomers(query: string): Promise<Customer[]> {
  try {
    const response = await fetch(
      `/api/customers?search=${encodeURIComponent(query)}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (err) {
    console.error("Error in searchCustomers:", err);
    return [];
  }
}

// Crear cliente
export async function createCustomer(
  customer: CustomerForm,
): Promise<Customer> {
  const response = await fetch("/api/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error creating customer");
  }

  return await response.json();
}

// Actualizar cliente
export async function updateCustomer(
  id: string,
  customer: Partial<CustomerForm>,
): Promise<Customer> {
  const response = await fetch(`/api/customers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error updating customer");
  }

  return await response.json();
}

// Eliminar cliente
export async function deleteCustomer(id: string): Promise<void> {
  const response = await fetch(`/api/customers/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error deleting customer");
  }
}
