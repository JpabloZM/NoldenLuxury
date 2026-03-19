"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import LoginCarritoModal from "./LoginCarritoModal";
import Toast from "./Toast";
import { agregarAlCarrito } from "../lib/carrito-utils";
import { fetchProducts } from "../lib/product-operations";
import type { ProductWithInventory } from "../lib/admin-types";

export default function Catalog() {
  const [products, setProducts] = useState<ProductWithInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const clienteToken =
    typeof window !== "undefined" ? localStorage.getItem("clienteToken") : null;

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await fetchProducts();
    setProducts(data.slice(0, 3)); // Mostrar solo los primeros 3 destacados
    setLoading(false);
  };

  const handleAgregarAlCarrito = (product: ProductWithInventory) => {
    if (!clienteToken) {
      setShowLoginModal(true);
      return;
    }

    if (product.inventory <= 0) {
      setToast({
        message: "Producto sin stock",
        type: "error",
      });
      return;
    }

    agregarAlCarrito({
      productId: product.id,
      productName: product.name,
      category: product.category,
      material: product.material,
      price: product.price,
      quantity: 1,
      image: product.image,
    });

    // Mostrar toast
    setToast({
      message: `${product.name} agregado al carrito`,
      type: "success",
    });
  };

  const handleAsesoriaPersonalizada = (product: ProductWithInventory) => {
    window.open(
      `https://wa.me/?text=Hola%20ARNOLUX%2C%20necesito%20asesor%C3%ADa%20personalizada%20sobre%20${encodeURIComponent(
        product.name,
      )}`,
      "_blank",
    );
  };

  if (loading) {
    return (
      <section id="catalogo" className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="text-center">
          <p className="text-slate-400">Cargando catálogo...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="catalogo" className="mx-auto w-full max-w-6xl px-6 py-16">
      <div>
        <h2 className="text-3xl font-semibold text-white">Catálogo</h2>
        <p className="mt-3 max-w-2xl text-slate-300">
          Descubre nuestros productos destacados en oro laminado 18K y plata
          925.
        </p>
      </div>
      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <article
            key={product.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70"
          >
            <div className="relative h-64 w-full bg-slate-800 flex items-center justify-center">
              {product.image && product.image !== "/placeholder.svg" ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <p className="text-slate-400 text-sm">Imagen no disponible</p>
              )}
            </div>
            <div className="flex flex-1 flex-col p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                {product.material}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                {product.name}
              </h3>
              <p className="mt-1 text-sm text-slate-400">{product.category}</p>
              <p className="mt-4 text-2xl font-bold text-white">
                ${product.price}
              </p>
              {product.inventory <= 0 && (
                <p className="mt-2 text-xs font-semibold text-red-400">
                  ⚠️ Sin stock
                </p>
              )}
              <div className="mt-auto space-y-2">
                <button
                  onClick={() => handleAgregarAlCarrito(product)}
                  disabled={product.inventory <= 0}
                  className="w-full rounded-lg bg-amber-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-900 transition hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🛒 Agregar al Carrito
                </button>
                <button
                  onClick={() => handleAsesoriaPersonalizada(product)}
                  className="w-full rounded-lg bg-slate-800 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  💬 Asesoría Personalizada
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {showLoginModal && (
        <LoginCarritoModal onClose={() => setShowLoginModal(false)} />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="mt-12 flex justify-center">
        <a
          href="/catalogo"
          className="rounded-lg bg-amber-300 px-8 py-3 font-semibold text-slate-900 transition hover:bg-amber-200"
        >
          Ver catálogo completo →
        </a>
      </div>
    </section>
  );
}
