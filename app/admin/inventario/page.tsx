"use client";

import { useEffect, useState } from "react";
import {
  InventoryItem,
  InventoryMovement,
  InventorySummary,
} from "@/app/lib/inventory-types";
import {
  fetchInventoryItems,
  fetchInventorySummary,
  fetchMovements,
  createMovement,
} from "@/app/lib/inventory-operations";
import AdminLayout from "@/app/admin/components/AdminLayout";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "material" | "product">(
    "all",
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "normal" | "bajo_stock"
  >("all");

  const [formData, setFormData] = useState({
    type: "ajuste" as const,
    item_type: "material" as const,
    item_id: "",
    item_name: "",
    quantity_before: 0,
    quantity_changed: 0,
    reason: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [itemsData, movementsData, summaryData] = await Promise.all([
        fetchInventoryItems(),
        fetchMovements(50),
        fetchInventorySummary(),
      ]);

      setItems(itemsData);
      setMovements(movementsData);
      setSummary(summaryData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(
        err instanceof Error ? err.message : "Error loading inventory data",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.item_id ||
      !formData.item_name ||
      formData.quantity_changed === 0
    ) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setError(null);
      await createMovement({
        type: formData.type,
        item_type: formData.item_type,
        item_id: formData.item_id,
        item_name: formData.item_name,
        quantity_before: Math.floor(formData.quantity_before),
        quantity_changed: Math.floor(formData.quantity_changed),
        reason: formData.reason || undefined,
      });

      setSuccessMessage("Movement recorded successfully");
      setShowForm(false);
      setFormData({
        type: "ajuste",
        item_type: "material",
        item_id: "",
        item_name: "",
        quantity_before: 0,
        quantity_changed: 0,
        reason: "",
      });

      setTimeout(() => setSuccessMessage(null), 3000);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating movement");
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesStatus =
      filterStatus === "all" || item.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <p className="text-slate-300">Cargando inventario...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-amber-300">
            Inventario Consolidado
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-amber-300 text-slate-900 px-4 py-2.5 rounded-lg font-semibold hover:bg-amber-400 transition"
          >
            {showForm ? "Cancelar" : "+ Registrar Movimiento"}
          </button>
        </div>

        {/* Stats Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <p className="text-slate-400 text-sm">Total Items</p>
              <p className="text-2xl font-bold text-amber-300">
                {summary.total_materials + summary.total_products}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {summary.total_materials} materiales + {summary.total_products}{" "}
                productos
              </p>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <p className="text-slate-400 text-sm">Bajo Stock</p>
              <p className="text-2xl font-bold text-red-400">
                {summary.materials_low_stock + summary.products_low_stock}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {summary.materials_low_stock} materiales +{" "}
                {summary.products_low_stock} productos
              </p>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <p className="text-slate-400 text-sm">Materiales</p>
              <p className="text-2xl font-bold text-emerald-400">
                {summary.total_materials}
              </p>
              <p className="text-xs text-slate-500 mt-1">Total en sistema</p>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <p className="text-slate-400 text-sm">Productos</p>
              <p className="text-2xl font-bold text-blue-400">
                {summary.total_products}
              </p>
              <p className="text-xs text-slate-500 mt-1">Total en sistema</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-600 text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-emerald-900/30 border border-emerald-600 text-emerald-300 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        {/* Movement Form */}
        {showForm && (
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h2 className="text-lg font-semibold text-amber-300 mb-4">
              Registrar Movimiento
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Tipo de Movimiento */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tipo de Movimiento *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as any })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                >
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                  <option value="ajuste">Ajuste</option>
                  <option value="produccion">Producción</option>
                </select>
              </div>

              {/* Tipo de Item */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tipo de Item *
                </label>
                <select
                  value={formData.item_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      item_type: e.target.value as any,
                    })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                >
                  <option value="material">Material</option>
                  <option value="product">Producto</option>
                </select>
              </div>

              {/* Item Name - Combobox with search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Item *{" "}
                  <span className="text-slate-400 font-normal">
                    (Escribe para buscar)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="items-list"
                    value={formData.item_name}
                    onChange={(e) => {
                      setFormData({ ...formData, item_name: e.target.value });
                      // Limpiar ID si el nombre no coincide con ninguno
                      const foundItem = items.find(
                        (item) =>
                          item.name === e.target.value &&
                          item.type === formData.item_type,
                      );
                      if (!foundItem) {
                        setFormData((prev) => ({
                          ...prev,
                          item_id: "",
                          quantity_before: 0,
                        }));
                      }
                    }}
                    onBlur={() => {
                      const foundItem = items.find(
                        (item) =>
                          item.name === formData.item_name &&
                          item.type === formData.item_type,
                      );
                      if (foundItem) {
                        setFormData({
                          ...formData,
                          item_id: foundItem.id,
                          quantity_before: foundItem.quantity,
                        });
                      }
                    }}
                    placeholder="Selecciona o escribe el nombre..."
                    className="w-full bg-slate-700 border-2 border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:bg-slate-700/60 transition-all duration-200"
                  />
                  <datalist id="items-list">
                    {items
                      .filter((item) => item.type === formData.item_type)
                      .map((item) => (
                        <option
                          key={item.id}
                          value={item.name}
                        >{`${item.name} (Stock: ${item.quantity})`}</option>
                      ))}
                  </datalist>
                </div>
              </div>

              {/* Cantidad Anterior */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Cantidad Anterior *
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={
                    formData.quantity_before === 0 && !formData.item_id
                      ? ""
                      : formData.quantity_before
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity_before:
                        e.target.value === ""
                          ? 0
                          : Math.floor(parseInt(e.target.value, 10)) || 0,
                    })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  onFocus={(e) => e.currentTarget.select()}
                />
              </div>

              {/* Cantidad Cambio */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Cantidad Cambio (+/-) *
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.quantity_changed}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity_changed:
                        e.target.value === ""
                          ? 0
                          : Math.floor(parseInt(e.target.value, 10)) || 0,
                    })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  onFocus={(e) => e.currentTarget.select()}
                />
              </div>

              {/* Reason */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Razón
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  placeholder="Razón del movimiento (opcional)"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500"
                />
              </div>

              {/* Submit */}
              <div className="md:col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white px-4 py-2.5 rounded font-semibold hover:bg-emerald-700 transition"
                >
                  Registrar Movimiento
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-700 text-white px-4 py-2.5 rounded font-semibold hover:bg-slate-600 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Recent Movements */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h2 className="text-lg font-semibold text-amber-300 mb-4">
            Movimientos Recientes
          </h2>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 font-semibold text-amber-300">
                    Tipo
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-amber-300">
                    Item
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-amber-300">
                    Categoría
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-amber-300">
                    Antes
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-amber-300">
                    Cambio
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-amber-300">
                    Después
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-amber-300">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr
                    key={movement.id}
                    className="border-b border-slate-700 hover:bg-slate-700/30 transition"
                  >
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          movement.type === "entrada"
                            ? "bg-emerald-900 text-emerald-300"
                            : movement.type === "salida"
                              ? "bg-red-900 text-red-300"
                              : movement.type === "produccion"
                                ? "bg-blue-900 text-blue-300"
                                : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {movement.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {movement.item_name}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          movement.item_type === "material"
                            ? "bg-amber-900 text-amber-300"
                            : "bg-violet-900 text-violet-300"
                        }`}
                      >
                        {movement.item_type === "material"
                          ? "Material"
                          : "Producto"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-300">
                      {movement.quantity_before}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={
                          movement.quantity_changed > 0
                            ? "text-emerald-400 font-semibold"
                            : movement.quantity_changed < 0
                              ? "text-red-400 font-semibold"
                              : "text-slate-400"
                        }
                      >
                        {movement.quantity_changed > 0 ? "+" : ""}
                        {movement.quantity_changed}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-300">
                      {movement.quantity_after}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">
                      {new Date(movement.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Items */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h2 className="text-lg font-semibold text-amber-300 mb-4">
            Items en Inventario ({filteredItems.length} / {items.length})
          </h2>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Buscar por nombre o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            >
              <option value="all">Todos los tipos</option>
              <option value="material">Materiales</option>
              <option value="product">Productos</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            >
              <option value="all">Todos los estados</option>
              <option value="normal">Normal</option>
              <option value="bajo_stock">Bajo Stock</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 font-semibold text-amber-300">
                    Nombre
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-amber-300">
                    Tipo
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-amber-300">
                    Cantidad
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-amber-300">
                    Mín.
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-amber-300">
                    Unidad
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-amber-300">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr
                    key={`${item.type}-${item.id}`}
                    className={`border-b border-slate-700 hover:bg-slate-700/30 transition ${
                      item.status === "bajo_stock" ? "bg-red-900/20" : ""
                    }`}
                  >
                    <td className="py-3 px-4 text-slate-300">{item.name}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.type === "material"
                            ? "bg-amber-900 text-amber-300"
                            : "bg-violet-900 text-violet-300"
                        }`}
                      >
                        {item.type === "material" ? "Material" : "Producto"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-white">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400">
                      {item.min_quantity}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {item.unit || "Unidad"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.status === "bajo_stock" ? (
                        <span className="px-2 py-1 bg-red-900 text-red-300 rounded text-xs font-semibold">
                          🔴 Bajo Stock
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-emerald-900 text-emerald-300 rounded text-xs font-semibold">
                          ✓ Normal
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
