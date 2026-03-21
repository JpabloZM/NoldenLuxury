"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import type { ProductWithInventory } from "@/app/lib/admin-types";
import type { Material } from "@/app/lib/admin-types";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/app/lib/product-operations";

interface MaterialUsed {
  material_id: string;
  material_name: string;
  quantity_used: number;
  unit: string;
}

export default function ProductosPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductWithInventory[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [materialsUsed, setMaterialsUsed] = useState<MaterialUsed[]>([]);
  const [selectedMaterialUnit, setSelectedMaterialUnit] = useState<string>("g");

  const [formData, setFormData] = useState({
    name: "",
    category: "Anillos" as const,
    material: "Oro Laminado 18K" as const,
    price: 0,
    image: "",
    inventory: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    const [productsData, materialsData] = await Promise.all([
      fetchProducts(),
      fetchMaterials(),
    ]);
    setProducts(productsData);
    setMaterials(materialsData);
    setLoading(false);
  };

  const fetchMaterials = async () => {
    try {
      // Agregar timestamp para forzar actualización y evitar cache
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/materials?t=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.map((m: any) => ({
        id: m.id,
        name: m.name,
        quantity: m.quantity,
        unit: m.unit || "g",
      }));
    } catch (err) {
      console.error("Error fetching materials:", err);
      return [];
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadForm,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, image: data.url }));
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(`Error al subir: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        const updated = await updateProduct(editingId, formData);
        if (updated) {
          setProducts(products.map((p) => (p.id === editingId ? updated : p)));
        }
        setEditingId(null);
      } else {
        // Crear producto
        const newProduct = await createProduct(formData);
        if (newProduct) {
          setProducts([newProduct, ...products]);

          // SI HAY MATERIALES, DESCONTAR AUTOMÁTICAMENTE
          if (materialsUsed.length > 0) {
            try {
              const response = await fetch(
                "/api/products/register-production",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    product_id: newProduct.id,
                    product_name: newProduct.name,
                    quantity_produced: formData.inventory,
                    materials_used: materialsUsed,
                  }),
                },
              );

              if (!response.ok) {
                const errorData = await response.json();
                alert(`Error al registrar movimientos: ${errorData.error}`);
              }
            } catch (err) {
              console.error("Error registering production:", err);
              alert(
                "Error al registrar movimientos de materiales. Se creó el producto pero no se descontaron los materiales.",
              );
            }
          }
        }
      }

      setFormData({
        name: "",
        category: "Anillos",
        material: "Oro Laminado 18K",
        price: 0,
        image: "",
        inventory: 0,
      });
      setMaterialsUsed([]);
      setImagePreview("");
      setShowForm(false);
      setSaving(false);
      await loadData();
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar este producto?")) {
      const success = await deleteProduct(id);
      if (success) {
        setProducts(products.filter((p) => p.id !== id));
      }
    }
  };

  const handleEdit = (product: ProductWithInventory) => {
    setFormData({
      name: product.name,
      category: product.category as typeof formData.category,
      material: product.material as typeof formData.material,
      price: Number(product.price) || 0,
      image: product.image,
      inventory: Number(product.inventory) || 0,
    });
    setImagePreview(product.image);
    setEditingId(product.id);
    setShowForm(true);
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Gestión de Productos
            </h1>
            <p className="text-slate-400 mt-1">
              Total: {products.length} productos {loading && "• Cargando..."}
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setImagePreview("");
              setFormData({
                name: "",
                category: "Anillos",
                material: "Oro Laminado 18K",
                price: 0,
                image: "",
                inventory: 0,
              });
            }}
            className="bg-amber-300 hover:bg-amber-400 text-slate-900 font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
            disabled={saving}
          >
            {showForm ? "Cancelar" : "Nuevo Producto"}
          </button>
        </div>

        {showForm && (
          <div className="mb-8 rounded-xl border border-white/10 bg-slate-900/50 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              {editingId ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
              {/* Columna Izquierda - Campos */}
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre del producto"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  disabled={saving}
                  className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-amber-300 outline-none disabled:opacity-50"
                />
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as any,
                    })
                  }
                  disabled={saving}
                  className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-white focus:border-amber-300 outline-none disabled:opacity-50"
                >
                  <option>Anillos</option>
                  <option>Collares</option>
                  <option>Arete</option>
                  <option>Pulseras</option>
                  <option>Tobilleras</option>
                  <option>Dijes</option>
                </select>
                <select
                  value={formData.material}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      material: e.target.value as any,
                    })
                  }
                  disabled={saving}
                  className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-white focus:border-amber-300 outline-none disabled:opacity-50"
                >
                  <option>Oro Laminado 18K</option>
                  <option>Plata 925</option>
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Precio"
                    value={formData.price || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: e.target.value ? parseFloat(e.target.value) : 0,
                      })
                    }
                    required
                    disabled={saving}
                    className="rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-amber-300 outline-none disabled:opacity-50"
                  />
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="Cantidad"
                    value={formData.inventory || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        inventory:
                          e.target.value === ""
                            ? 0
                            : Math.floor(parseInt(e.target.value, 10)) || 0,
                      })
                    }
                    required
                    disabled={saving}
                    className="rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-amber-300 outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Columna Derecha - Imagen */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Imagen del Producto
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading || saving}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-white focus:border-amber-300 outline-none disabled:opacity-50 cursor-pointer"
                  />
                  {uploading && (
                    <p className="text-sm text-amber-300 mt-2">
                      ⏳ Subiendo imagen...
                    </p>
                  )}
                </div>
                {imagePreview && (
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-medium text-slate-300 mb-3">
                      Vista previa:
                    </p>
                    <img
                      src={imagePreview}
                      alt="preview"
                      style={{ height: "100px" }}
                      className="object-contain rounded-lg border border-white/10 bg-slate-800 p-2"
                    />
                  </div>
                )}
              </div>

              {/* Sección de Materiales - Solo para nuevos productos */}
              {!editingId && (
                <div className="col-span-full">
                  <h3 className="text-lg font-semibold text-amber-300 mb-4">
                    Materiales Utilizados (Opcional)
                  </h3>

                  {materialsUsed.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {materialsUsed.map((mat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-slate-700 p-3 rounded"
                        >
                          <div>
                            <p className="text-white font-medium">
                              {mat.material_name}
                            </p>
                            <p className="text-sm text-slate-400">
                              {mat.quantity_used} {mat.unit}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setMaterialsUsed(
                                materialsUsed.filter((_, i) => i !== idx),
                              )
                            }
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Quitar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <select
                      id="material-select"
                      defaultValue=""
                      onChange={(e) => {
                        const selectedMat = materials.find(
                          (m) => m.id === e.target.value,
                        );
                        setSelectedMaterialUnit(selectedMat?.unit || "g");
                      }}
                      className="rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-white focus:border-amber-300 outline-none"
                    >
                      <option value="">Selecciona material...</option>
                      {materials.map((mat) => (
                        <option key={mat.id} value={mat.id}>
                          {mat.name} ({mat.unit})
                        </option>
                      ))}
                    </select>

                    <div>
                      <input
                        type="number"
                        id="material-quantity"
                        placeholder={`Cantidad (${selectedMaterialUnit})`}
                        min="0.1"
                        step="0.1"
                        defaultValue=""
                        className="rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-amber-300 outline-none w-full"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const select = document.getElementById(
                          "material-select",
                        ) as HTMLSelectElement;
                        const quantity = document.getElementById(
                          "material-quantity",
                        ) as HTMLInputElement;

                        if (select.value && quantity.value) {
                          const selectedMaterial = materials.find(
                            (m) => m.id === select.value,
                          );
                          if (selectedMaterial) {
                            setMaterialsUsed([
                              ...materialsUsed,
                              {
                                material_id: select.value,
                                material_name: selectedMaterial.name,
                                quantity_used: parseFloat(quantity.value),
                                unit: selectedMaterial.unit || "g",
                              },
                            ]);
                            select.value = "";
                            quantity.value = "";
                            setSelectedMaterialUnit("g");
                          }
                        }
                      }}
                      className="bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Agregar Material
                    </button>
                  </div>
                </div>
              )}

              {/* Botón - Ancho completo */}
              <button
                type="submit"
                disabled={saving}
                className="col-span-full bg-green-600 px-6 py-3 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving
                  ? "⏳ Guardando..."
                  : editingId
                    ? "✓ Actualizar Producto"
                    : "✚ Crear Producto"}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-white/10 p-12 text-center">
            <p className="text-slate-400 mb-4">No hay productos creados</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-amber-300 hover:text-amber-200 font-semibold"
            >
              Crea el primero →
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-900/70 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-amber-300">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-amber-300">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-amber-300">
                    Material
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-amber-300">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-amber-300">
                    Inventario
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-amber-300">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-white/10 hover:bg-slate-900/30"
                  >
                    <td className="px-6 py-4 text-white">{product.name}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {product.material}
                    </td>
                    <td className="px-6 py-4 text-white font-semibold">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${product.inventory < 5 ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300"}`}
                      >
                        {product.inventory} unidades
                      </span>
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        disabled={saving}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={saving}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
