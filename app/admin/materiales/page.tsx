"use client";

import { useEffect, useState } from "react";
import type { Material, MaterialForm } from "@/app/lib/material-types";
import {
  fetchMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "@/app/lib/material-operations";

export default function MaterialesPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MaterialForm>({
    name: "",
    quantity: 0,
    unit: "",
    min_quantity: 50,
    cost_per_unit: undefined,
    supplier: undefined,
  });
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Cargar materiales
  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMaterials();
      setMaterials(data);
    } catch (err) {
      console.error("Error loading materials:", err);
      setError("Error cargando materiales. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Limpiar formulario
  const resetForm = () => {
    setFormData({
      name: "",
      quantity: 0,
      unit: "",
      min_quantity: 50,
      cost_per_unit: undefined,
      supplier: undefined,
    });
    setEditingId(null);
  };

  // Cargar material para editar
  const handleEdit = (material: Material) => {
    setFormData({
      name: material.name,
      quantity: material.quantity,
      unit: material.unit,
      min_quantity: material.min_quantity,
      cost_per_unit: material.cost_per_unit,
      supplier: material.supplier,
    });
    setEditingId(material.id);
    setShowForm(true);
  };

  // Guardar material (crear o actualizar)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.unit) {
      alert("Por favor completa los campos requeridos");
      return;
    }

    if (editingId) {
      // Actualizar
      const result = await updateMaterial(editingId, formData);
      if (result) {
        setSuccessMessage("Material actualizado correctamente");
        await loadMaterials();
        resetForm();
        setShowForm(false);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } else {
      // Crear
      const result = await createMaterial(formData);
      if (result) {
        setSuccessMessage("Material creado correctamente");
        await loadMaterials();
        resetForm();
        setShowForm(false);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    }
  };

  // Eliminar material
  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este material?")) {
      const result = await deleteMaterial(id);
      if (result) {
        setSuccessMessage("Material eliminado correctamente");
        await loadMaterials();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    }
  };

  // Cancelar edición
  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Gestión de Materiales
          </h1>
          <p className="text-slate-400 mt-1">
            Total: {materials.length} materiales {isLoading && "• Cargando..."}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-300 hover:bg-amber-400 text-slate-900 font-semibold px-6 py-2.5 rounded-lg transition"
        >
          {showForm ? "Cancelar" : "Nuevo Material"}
        </button>
      </div>

      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="mb-4 p-4 bg-emerald-500/20 border border-emerald-400 text-emerald-200 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-400 text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="mb-8 p-6 bg-slate-800/50 border border-slate-700 rounded-lg gap-6 grid md:grid-cols-2"
        >
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nombre del Material *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="ej: Oro Laminado 18K"
              className="w-full px-4 py-2.5 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent placeholder:text-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Cantidad *
            </label>
            <input
              type="number"
              value={formData.quantity || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity: e.target.value ? parseFloat(e.target.value) : 0,
                })
              }
              onFocus={(e) => e.target.select()}
              placeholder="0"
              className="w-full px-4 py-2.5 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent placeholder:text-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Unidad *
            </label>
            <select
              value={formData.unit}
              onChange={(e) =>
                setFormData({ ...formData, unit: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
              required
            >
              <option value="">Selecciona una unidad</option>
              <option value="gramos">Gramos</option>
              <option value="kilos">Kilos</option>
              <option value="metros">Metros</option>
              <option value="centimetros">Centímetros</option>
              <option value="piezas">Piezas</option>
              <option value="pares">Pares</option>
              <option value="sets">Sets</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Cantidad Mínima
            </label>
            <input
              type="number"
              value={formData.min_quantity || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  min_quantity: e.target.value ? parseFloat(e.target.value) : 0,
                })
              }
              onBlur={(e) => {
                if (!e.target.value) {
                  setFormData({
                    ...formData,
                    min_quantity: 50,
                  });
                }
              }}
              onFocus={(e) => e.target.select()}
              placeholder="50"
              className="w-full px-4 py-2.5 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Costo por Unidad
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.cost_per_unit || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cost_per_unit: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
              onFocus={(e) => e.target.select()}
              placeholder="0.00"
              className="w-full px-4 py-2.5 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Proveedor
            </label>
            <input
              type="text"
              value={formData.supplier || ""}
              onChange={(e) =>
                setFormData({ ...formData, supplier: e.target.value })
              }
              placeholder="Nombre del proveedor"
              className="w-full px-4 py-2.5 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent placeholder:text-slate-500"
            />
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-lg transition"
            >
              {editingId ? "Actualizar" : "Crear"} Material
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-semibold px-4 py-2.5 rounded-lg transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de materiales */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">
          Cargando materiales...
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">
            No hay materiales. Crea uno nuevo para empezar.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-700 rounded-lg">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-amber-300">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-amber-300">
                  Cantidad
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-amber-300">
                  Unidad
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-amber-300">
                  Mín.
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-amber-300">
                  Costo/Unid.
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-amber-300">
                  Proveedor
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-amber-300">
                  Estado
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-amber-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {materials.map((material) => {
                const isLow = material.quantity < material.min_quantity;
                return (
                  <tr
                    key={material.id}
                    className={`hover:bg-slate-800/30 transition ${isLow ? "bg-red-950/20" : ""}`}
                  >
                    <td className="px-4 py-3 text-slate-200">
                      {material.name}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {material.quantity}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {material.unit}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {material.min_quantity}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {material.cost_per_unit
                        ? `$${material.cost_per_unit.toFixed(2)}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {material.supplier || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {isLow ? (
                        <span className="bg-red-500/30 text-red-300 px-3 py-1 rounded-full text-xs font-medium border border-red-500/50">
                          Bajo Stock
                        </span>
                      ) : (
                        <span className="bg-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/50">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(material)}
                        className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-1.5 rounded-lg text-sm font-medium transition border border-amber-500/30 hover:border-amber-400"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-lg text-sm font-medium transition border border-red-500/30 hover:border-red-400"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
