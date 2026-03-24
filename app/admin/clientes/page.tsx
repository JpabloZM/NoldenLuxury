"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import type { Customer, CustomerForm } from "@/app/lib/customers-types";
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/app/lib/customers-operations";

export default function ClientesPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState<CustomerForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    notes: "",
    source: "manual",
  });

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    loadCustomers();
  }, [router]);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading customers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("El nombre del cliente es requerido");
      return;
    }

    try {
      setError(null);
      const newCustomer = await createCustomer(formData);
      setCustomers([newCustomer, ...customers]);
      setSuccessMessage("Cliente creado exitosamente");
      setShowForm(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        notes: "",
        source: "manual",
      });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating customer");
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) return;

    try {
      setError(null);
      const updated = await updateCustomer(selectedCustomer.id, formData);
      setCustomers(
        customers.map((c) => (c.id === selectedCustomer.id ? updated : c)),
      );
      setSelectedCustomer(updated);
      setSuccessMessage("Cliente actualizado exitosamente");
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating customer");
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("¿Eliminar este cliente? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      setError(null);
      await deleteCustomer(id);
      setCustomers(customers.filter((c) => c.id !== id));
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(null);
        setIsEditing(false);
      }
      setSuccessMessage("Cliente eliminado exitosamente");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting customer");
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditing(false);
    setFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      city: customer.city || "",
      state: customer.state || "",
      zip_code: customer.zip_code || "",
      notes: customer.notes || "",
      source: customer.source,
    });
  };

  const handleEditStart = () => {
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    if (selectedCustomer) {
      setFormData({
        name: selectedCustomer.name,
        email: selectedCustomer.email || "",
        phone: selectedCustomer.phone || "",
        address: selectedCustomer.address || "",
        city: selectedCustomer.city || "",
        state: selectedCustomer.state || "",
        zip_code: selectedCustomer.zip_code || "",
        notes: selectedCustomer.notes || "",
        source: selectedCustomer.source,
      });
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.phone && c.phone.includes(searchQuery)),
  );

  const registeredCount = customers.filter(
    (c) => c.source === "registered",
  ).length;
  const manualCount = customers.filter((c) => c.source === "manual").length;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <p className="text-slate-300">Cargando clientes...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-amber-300">
            Gestión de Clientes
          </h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setIsEditing(false);
              if (!showForm) {
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  address: "",
                  city: "",
                  state: "",
                  zip_code: "",
                  notes: "",
                  source: "manual",
                });
              }
            }}
            className="bg-amber-300 text-slate-900 px-4 py-2.5 rounded-lg font-semibold hover:bg-amber-400 transition"
          >
            {showForm ? "Cancelar" : "+ Agregar Cliente"}
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
            <p className="text-xs font-medium text-blue-200">Total Clientes</p>
            <p className="mt-2 text-2xl font-bold text-blue-300">
              {customers.length}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-xs font-medium text-emerald-200">Registrados</p>
            <p className="mt-2 text-2xl font-bold text-emerald-300">
              {registeredCount}
            </p>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-xs font-medium text-amber-200">Manual</p>
            <p className="mt-2 text-2xl font-bold text-amber-300">
              {manualCount}
            </p>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-900/30 border border-red-600 text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-emerald-900/30 border border-emerald-600 text-emerald-300 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        {/* Formulario */}
        {showForm && (
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h2 className="text-lg font-semibold text-amber-300 mb-4">
              Nuevo Cliente
            </h2>
            <form
              onSubmit={handleCreateCustomer}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nombre del cliente"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="email@ejemplo.com"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+1 234 567 8900"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Calle..."
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Ciudad"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Estado/Provincia
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  placeholder="Estado"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Código Postal
                </label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) =>
                    setFormData({ ...formData, zip_code: e.target.value })
                  }
                  placeholder="00000"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Notas adicionales..."
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 h-20"
                />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-amber-300 text-slate-900 font-semibold py-2 rounded-lg hover:bg-amber-400 transition"
                >
                  Guardar Cliente
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-700 text-white font-semibold py-2 rounded-lg hover:bg-slate-600 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Búsqueda y Lista */}
        <div className="grid gap-6 md:grid-cols-4">
          {/* Lista de clientes */}
          <div className="md:col-span-1">
            <div className="rounded-xl border border-white/10 bg-slate-900/50 overflow-hidden">
              <div className="border-b border-white/10 px-4 py-3 bg-slate-900">
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="max-h-96 overflow-y-auto">
                {filteredCustomers.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-sm">
                    No hay clientes
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      className={`w-full text-left px-4 py-3 border-b border-white/5 transition ${
                        selectedCustomer?.id === customer.id
                          ? "bg-amber-300/20 border-l-2 border-l-amber-300"
                          : "hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">
                            {customer.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {customer.email}
                          </p>
                        </div>
                        <span
                          className={`ml-2 text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
                            customer.source === "registered"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-slate-500/20 text-slate-300"
                          }`}
                        >
                          {customer.source === "registered" ? "R" : "M"}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Detalle del cliente */}
          <div className="md:col-span-3">
            {selectedCustomer ? (
              <div className="rounded-xl border border-white/10 bg-slate-900/50 p-6">
                {!isEditing ? (
                  <>
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-semibold text-white">
                          {selectedCustomer.name}
                        </h2>
                        <span
                          className={`mt-2 inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                            selectedCustomer.source === "registered"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-slate-500/20 text-slate-300"
                          }`}
                        >
                          {selectedCustomer.source === "registered"
                            ? "Cliente Registrado"
                            : "Cliente Manual"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleEditStart}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteCustomer(selectedCustomer.id)
                          }
                          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-slate-400 mb-1">
                          Email
                        </p>
                        <p className="text-white">
                          {selectedCustomer.email || "No especificado"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-400 mb-1">
                          Teléfono
                        </p>
                        <p className="text-white">
                          {selectedCustomer.phone || "No especificado"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-400 mb-1">
                          Dirección
                        </p>
                        <p className="text-white">
                          {selectedCustomer.address || "No especificada"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-400 mb-1">
                          Ciudad
                        </p>
                        <p className="text-white">
                          {selectedCustomer.city || "No especificada"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-400 mb-1">
                          Estado
                        </p>
                        <p className="text-white">
                          {selectedCustomer.state || "No especificado"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-400 mb-1">
                          Código Postal
                        </p>
                        <p className="text-white">
                          {selectedCustomer.zip_code || "No especificado"}
                        </p>
                      </div>
                    </div>

                    {selectedCustomer.notes && (
                      <div className="mt-6">
                        <p className="text-xs font-medium text-slate-400 mb-2">
                          Notas
                        </p>
                        <div className="rounded-lg bg-slate-800/50 p-4 border border-white/10">
                          <p className="text-slate-300 text-sm whitespace-pre-wrap">
                            {selectedCustomer.notes}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 text-xs text-slate-500">
                      Creado:{" "}
                      {new Date(selectedCustomer.created_at).toLocaleDateString(
                        "es-ES",
                      )}
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleUpdateCustomer} className="space-y-4">
                    <h3 className="text-lg font-semibold text-amber-300 mb-4">
                      Editar Cliente
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Dirección
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Ciudad
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Estado
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) =>
                            setFormData({ ...formData, state: e.target.value })
                          }
                          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Código Postal
                        </label>
                        <input
                          type="text"
                          value={formData.zip_code}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              zip_code: e.target.value,
                            })
                          }
                          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Notas
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400 h-20"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-amber-300 text-slate-900 font-semibold py-2 rounded-lg hover:bg-amber-400 transition"
                      >
                        Guardar Cambios
                      </button>
                      <button
                        type="button"
                        onClick={handleEditCancel}
                        className="flex-1 bg-slate-700 text-white font-semibold py-2 rounded-lg hover:bg-slate-600 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-slate-900/50 p-12 text-center">
                <p className="text-slate-400">
                  Selecciona un cliente para ver los detalles
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
