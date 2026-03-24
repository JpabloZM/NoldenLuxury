"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import LoginCarritoModal from "@/app/components/LoginCarritoModal";
import Toast from "@/app/components/Toast";
import Header from "@/app/components/Header";
import { agregarAlCarrito } from "@/app/lib/carrito-utils";
import { fetchProducts } from "@/app/lib/product-operations";

type CategoryFilter =
  | "Todos"
  | "Anillos"
  | "Collares"
  | "Arete"
  | "Pulseras"
  | "Tobilleras"
  | "Dijes";

interface Product {
  id: string;
  name: string;
  category: string;
  material: string;
  price: number;
  image: string;
}

export default function CatalogoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<CategoryFilter>("Todos");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const clienteToken =
    typeof window !== "undefined" ? localStorage.getItem("clienteToken") : null;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error("Error cargando productos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts =
    filter === "Todos"
      ? products
      : products.filter((p) => p.category === filter);

  const handleAgregarAlCarrito = (product: any) => {
    if (!clienteToken) {
      setShowLoginModal(true);
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

  const handleAsesoriaPersonalizada = (product: any) => {
    window.open(
      `https://wa.me/?text=Hola%20ARNOLUX%2C%20necesito%20asesor%C3%ADa%20personalizada%20sobre%20${encodeURIComponent(
        product.name,
      )}`,
      "_blank",
    );
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="mb-12">
          <a
            href="/"
            className="text-amber-300 hover:text-amber-200 font-semibold mb-4 inline-block"
          >
            ← Volver a inicio
          </a>
          <h1 className="text-4xl font-bold text-white">Catálogo Completo</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Explora toda nuestra colección de joyería en oro laminado 18K y
            plata 925.
          </p>
        </div>

        <div className="mb-8 flex gap-2 rounded-lg bg-slate-800 p-1.5 w-fit flex-wrap">
          {(
            [
              "Todos",
              "Anillos",
              "Collares",
              "Arete",
              "Pulseras",
              "Tobilleras",
              "Dijes",
            ] as CategoryFilter[]
          ).map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition
                ${
                  filter === category
                    ? "bg-amber-300 text-slate-900"
                    : "bg-transparent text-slate-300 hover:bg-slate-700"
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-400">Cargando productos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-400">No hay productos disponibles</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70"
              >
                <div className="relative h-64 w-full bg-slate-800">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                    {product.material}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {product.category}
                  </p>
                  <p className="mt-4 text-2xl font-bold text-white">
                    ${product.price}
                  </p>
                  <div className="mt-auto space-y-2">
                    <button
                      onClick={() => handleAgregarAlCarrito(product)}
                      className="w-full rounded-lg bg-amber-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-900 transition hover:bg-amber-200"
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
            ))
          )}
        </div>
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
    </main>
  );
}
