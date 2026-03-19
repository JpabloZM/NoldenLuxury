"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import type { ProductWithInventory } from "@/app/lib/admin-types";

export default function InventarioPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductWithInventory[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    const stored = localStorage.getItem("adminProducts");
    if (stored) {
      setProducts(JSON.parse(stored));
    }
  }, [router]);

  const handleUpdateInventory = (id: string, newValue: number) => {
    const updated = products.map((p) =>
      p.id === id ? { ...p, inventory: newValue } : p,
    );
    setProducts(updated);
    localStorage.setItem("adminProducts", JSON.stringify(updated));
    setEditingId(null);
  };

  const lowInventory = products.filter((p) => p.inventory < 5);
  const outOfStock = products.filter((p) => p.inventory === 0);

  return (
    <AdminLayout>
      <div>
        <h1 className="text-4xl font-bold text-white mb-8">
          Gestión de Inventario
        </h1>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6">
            <p className="text-sm font-medium text-yellow-200">Stock Bajo</p>
            <p className="mt-2 text-3xl font-bold text-yellow-300">
              {lowInventory.length}
            </p>
            <p className="mt-1 text-xs text-yellow-300/70">
              Productos con menos de 5 unidades
            </p>
          </div>
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
            <p className="text-sm font-medium text-red-200">Sin Stock</p>
            <p className="mt-2 text-3xl font-bold text-red-300">
              {outOfStock.length}
            </p>
            <p className="mt-1 text-xs text-red-300/70">Productos agotados</p>
          </div>
        </div>

        <div className="space-y-6">
          {products.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-8 text-center">
              <p className="text-slate-400">
                No hay productos registrados. Crea uno primero en Gestión de
                Productos.
              </p>
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className={`rounded-xl border p-6 transition ${
                  product.inventory === 0
                    ? "border-red-500/30 bg-red-500/10"
                    : product.inventory < 5
                      ? "border-yellow-500/30 bg-yellow-500/10"
                      : "border-white/10 bg-slate-900/50 hover:bg-slate-900/70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {product.name}
                    </h3>
                    <div className="mt-2 flex gap-4 text-sm text-slate-400">
                      <span>{product.category}</span>
                      <span>•</span>
                      <span>{product.material}</span>
                      <span>•</span>
                      <span>${product.price}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    {editingId === product.id ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-20 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-white text-center focus:border-amber-300 outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() =>
                            handleUpdateInventory(
                              product.id,
                              parseInt(editValue),
                            )
                          }
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-600 transition"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <>
                        <p
                          className={`text-3xl font-bold ${
                            product.inventory === 0
                              ? "text-red-300"
                              : product.inventory < 5
                                ? "text-yellow-300"
                                : "text-green-300"
                          }`}
                        >
                          {product.inventory}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          unidades en stock
                        </p>
                        <button
                          onClick={() => {
                            setEditingId(product.id);
                            setEditValue(String(product.inventory));
                          }}
                          className="mt-3 px-4 py-2 bg-amber-300 text-slate-900 text-sm font-medium rounded-lg hover:bg-amber-200 transition"
                        >
                          Actualizar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
