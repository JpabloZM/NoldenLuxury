"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import type { Order } from "@/app/lib/admin-types";

export default function PedidosPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    const stored = localStorage.getItem("adminOrders");
    if (stored) {
      setOrders(JSON.parse(stored));
    }
  }, [router]);

  const updateOrderStatus = (id: string, newStatus: Order["status"]) => {
    const updated = orders.map((o) =>
      o.id === id ? { ...o, status: newStatus } : o,
    );
    setOrders(updated);
    localStorage.setItem("adminOrders", JSON.stringify(updated));
  };

  const pendingOrders = orders.filter((o) => o.status === "Pendiente");
  const confirmedOrders = orders.filter((o) => o.status === "Confirmado");
  const shippedOrders = orders.filter((o) => o.status === "Enviado");
  const deliveredOrders = orders.filter((o) => o.status === "Entregado");

  return (
    <AdminLayout>
      <div>
        <h1 className="text-4xl font-bold text-white mb-8">
          Gestión de Pedidos
        </h1>

        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
            <p className="text-xs font-medium text-orange-200">Pendientes</p>
            <p className="mt-2 text-2xl font-bold text-orange-300">
              {pendingOrders.length}
            </p>
          </div>
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
            <p className="text-xs font-medium text-blue-200">Confirmados</p>
            <p className="mt-2 text-2xl font-bold text-blue-300">
              {confirmedOrders.length}
            </p>
          </div>
          <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
            <p className="text-xs font-medium text-purple-200">Enviados</p>
            <p className="mt-2 text-2xl font-bold text-purple-300">
              {shippedOrders.length}
            </p>
          </div>
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
            <p className="text-xs font-medium text-green-200">Entregados</p>
            <p className="mt-2 text-2xl font-bold text-green-300">
              {deliveredOrders.length}
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-8 text-center">
            <p className="text-slate-400">No hay pedidos registrados aún.</p>
            <p className="text-xs text-slate-500 mt-2">
              Los pedidos de clientes aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-white/10 bg-slate-900/50 p-6 hover:bg-slate-900/70 transition"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="font-semibold text-white text-lg mb-2">
                      Pedido #{order.id.substring(0, 8)}
                    </h3>
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="text-sm text-slate-300 bg-slate-800/50 rounded p-2"
                        >
                          <p className="font-medium text-white">
                            {item.productName}
                          </p>
                          <p>
                            {item.material} • {item.quantity}x ${item.price}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-slate-400">
                      <p>
                        Cliente:{" "}
                        <span className="text-white">{order.customerName}</span>
                      </p>
                      <p>
                        Email:{" "}
                        <span className="text-white">
                          {order.customerEmail}
                        </span>
                      </p>
                      <p>
                        Total:{" "}
                        <span className="text-amber-300 font-semibold">
                          ${order.totalPrice}
                        </span>
                      </p>
                      <p>
                        Fecha:{" "}
                        <span className="text-white">
                          {new Date(order.createdAt).toLocaleDateString(
                            "es-ES",
                          )}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-4">
                      <p className="text-xs font-medium text-slate-400 mb-2">
                        Estado del Pedido
                      </p>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(
                            order.id,
                            e.target.value as Order["status"],
                          )
                        }
                        className={`w-full rounded-lg px-4 py-2 font-medium outline-none ${
                          order.status === "Pendiente"
                            ? "bg-orange-500/20 text-orange-300 border border-orange-500/50"
                            : order.status === "Confirmado"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/50"
                              : order.status === "Enviado"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                                : "bg-green-500/20 text-green-300 border border-green-500/50"
                        }`}
                      >
                        <option>Pendiente</option>
                        <option>Confirmado</option>
                        <option>Enviado</option>
                        <option>Entregado</option>
                        <option>Cancelado</option>
                      </select>
                    </div>
                    {order.notes && (
                      <div className="text-sm">
                        <p className="text-slate-400">Notas:</p>
                        <p className="text-white">{order.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
