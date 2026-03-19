"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { CarritoItem } from "@/app/lib/admin-types";
import {
  obtenerCarrito,
  removerDelCarrito,
  actualizarCantidad,
  vaciarCarrito,
  calcularTotal,
} from "@/app/lib/carrito-utils";

export default function CarritoPage() {
  const router = useRouter();
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clienteData, setClienteData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("clienteToken");
    if (!token) {
      router.push("/login");
      return;
    }

    const clientes = JSON.parse(localStorage.getItem("clientes") || "[]");
    const cliente = clientes.find((c: any) => c.id === token);
    if (cliente) {
      setClienteData(cliente);
    }

    const carritoData = obtenerCarrito();
    setCarrito(carritoData);
    setLoading(false);
  }, [router]);

  const handleRemover = (productId: string, material: string) => {
    const updated = removerDelCarrito(productId, material);
    setCarrito(updated);
  };

  const handleActualizarCantidad = (
    productId: string,
    material: string,
    cantidad: number
  ) => {
    if (cantidad <= 0) {
      handleRemover(productId, material);
    } else {
      const updated = actualizarCantidad(productId, material, cantidad);
      setCarrito(updated);
    }
  };

  const handleVaciarCarrito = () => {
    if (confirm("¿Estás seguro de que deseas vaciar el carrito?")) {
      vaciarCarrito();
      setCarrito([]);
    }
  };

  const handleConfirmarCompra = () => {
    if (carrito.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    const total = calcularTotal();
    const mensaje = `Hola ARNOLUX, me gustaría confirmar mi compra:\n\n${carrito
      .map((item) => `- ${item.productName} (${item.material}): ${item.quantity}x $${item.price}`)
      .join("\n")}\n\nTotal: $${total}\n\nNombre: ${clienteData?.nombre}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-white">Cargando carrito...</p>
      </div>
    );
  }

  const total = calcularTotal();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-900/50">
        <div className="mx-auto w-full max-w-6xl px-6 py-6">
          <Link href="/" className="text-amber-300 hover:text-amber-200 font-semibold">
            ← Volver a inicio
          </Link>
          <h1 className="text-3xl font-bold text-white mt-3">Mi Carrito</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        {carrito.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-12 text-center">
            <p className="text-2xl font-bold text-white">Tu carrito está vacío</p>
            <p className="text-slate-400 mt-2">Agrega productos para empezar</p>
            <Link
              href="/catalogo"
              className="mt-6 inline-block px-6 py-3 bg-amber-300 text-slate-900 font-semibold rounded-lg hover:bg-amber-200 transition"
            >
              Ver Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Lista de productos */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {carrito.map((item) => (
                  <div
                    key={`${item.productId}-${item.material}`}
                    className="rounded-lg border border-white/10 bg-slate-900/50 p-6 hover:bg-slate-900/70 transition"
                  >
                    <div className="grid gap-4 md:grid-cols-4 items-start">
                      {/* Imagen */}
                      <div className="relative h-24 w-full bg-slate-800 rounded-lg overflow-hidden md:col-span-1">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.productName}
                          fill
                          className="object-contain p-2"
                        />
                      </div>

                      {/* Detalles */}
                      <div className="md:col-span-2">
                        <h3 className="font-semibold text-white text-lg">
                          {item.productName}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                          {item.category} • {item.material}
                        </p>
                        <p className="text-amber-300 font-semibold mt-2">
                          ${item.price} c/u
                        </p>
                      </div>

                      {/* Cantidad y acciones */}
                      <div className="md:col-span-1 space-y-3">
                        <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-2">
                          <button
                            onClick={() =>
                              handleActualizarCantidad(
                                item.productId,
                                item.material,
                                item.quantity - 1
                              )
                            }
                            className="px-2 py-1 text-slate-400 hover:text-white"
                          >
                            −
                          </button>
                          <span className="flex-1 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleActualizarCantidad(
                                item.productId,
                                item.material,
                                item.quantity + 1
                              )
                            }
                            className="px-2 py-1 text-slate-400 hover:text-white"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-white font-bold text-center">
                          ${item.price * item.quantity}
                        </p>
                        <button
                          onClick={() =>
                            handleRemover(item.productId, item.material)
                          }
                          className="w-full px-3 py-2 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleVaciarCarrito}
                className="mt-6 px-4 py-2 bg-slate-800 text-white text-sm rounded hover:bg-slate-700 transition"
              >
                🗑️ Vaciar Carrito
              </button>
            </div>

            {/* Resumen */}
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-white/10 bg-slate-900/50 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-white mb-6">Resumen</h2>

                <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal:</span>
                    <span>${total}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Envío:</span>
                    <span className="text-amber-300">A conversar</span>
                  </div>
                </div>

                <div className="flex justify-between text-xl font-bold text-white mb-6">
                  <span>Total:</span>
                  <span className="text-amber-300">${total}</span>
                </div>

                <button
                  onClick={handleConfirmarCompra}
                  className="w-full px-6 py-3 bg-amber-300 text-slate-900 font-semibold rounded-lg hover:bg-amber-200 transition mb-3"
                >
                  Confirmar por WhatsApp
                </button>

                <Link
                  href="/catalogo"
                  className="block w-full px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition text-center"
                >
                  Seguir Comprando
                </Link>

                <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-400">
                    Tus datos están protegidos. La confirmación se realizará por WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
