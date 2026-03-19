"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Cliente, Order } from "@/app/lib/admin-types";

export default function ClienteDashboard() {
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    ciudad: "",
    direccionEntrega: "",
  });
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("clienteToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    const clientes = JSON.parse(localStorage.getItem("clientes") || "[]");
    const clienteData = clientes.find((c: any) => c.id === token);

    if (!clienteData) {
      router.replace("/login");
      return;
    }

    setCliente(clienteData);
    setFormData({
      nombre: clienteData.nombre,
      telefono: clienteData.telefono || "",
      ciudad: clienteData.ciudad || "",
      direccionEntrega: clienteData.direccionEntrega || "",
    });

    const allOrders = JSON.parse(localStorage.getItem("adminOrders") || "[]");
    const clienteOrders = allOrders.filter((o: any) => o.clienteId === token);
    setPedidos(clienteOrders);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("clienteToken");
    localStorage.removeItem("clienteEmail");
    router.push("/");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGuardarCambios = () => {
    setError("");
    setExito("");

    if (!formData.nombre || !formData.ciudad || !formData.direccionEntrega) {
      setError("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      const token = localStorage.getItem("clienteToken");
      if (!token) return;

      const clientes = JSON.parse(localStorage.getItem("clientes") || "[]");
      const clienteIndex = clientes.findIndex((c: any) => c.id === token);

      if (clienteIndex !== -1) {
        clientes[clienteIndex] = {
          ...clientes[clienteIndex],
          nombre: formData.nombre,
          telefono: formData.telefono,
          ciudad: formData.ciudad,
          direccionEntrega: formData.direccionEntrega,
        };

        localStorage.setItem("clientes", JSON.stringify(clientes));
        setCliente(clientes[clienteIndex]);
        setEditando(false);
        setExito("Datos actualizados correctamente ✓");
        setTimeout(() => setExito(""), 3000);
      }
    } catch (err) {
      setError("Error al guardar los cambios");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-white">Cargando...</p>
      </div>
    );
  }

  if (!cliente) {
    return null;
  }

  const estadisticas = {
    totalPedidos: pedidos.length,
    totalGastado: pedidos.reduce((sum, p) => sum + p.totalPrice, 0),
    pedidosPendientes: pedidos.filter(p => p.status === "Pendiente").length,
    pedidosEntregados: pedidos.filter(p => p.status === "Entregado").length,
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50">
        <div className="mx-auto w-full max-w-6xl px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-300">ARNOLUX</h1>
            <p className="text-sm text-slate-400 mt-1">Mi Cuenta</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        {/* Bienvenida */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white">Bienvenido, {cliente.nombre}! 👋</h2>
          <p className="text-slate-400 mt-2">Email: {cliente.email}</p>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-6">
            <p className="text-sm font-medium text-blue-200">Total de Pedidos</p>
            <p className="mt-3 text-4xl font-bold text-blue-300">{pedidos.length}</p>
          </div>
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6">
            <p className="text-sm font-medium text-green-200">Entregados</p>
            <p className="mt-3 text-4xl font-bold text-green-300">
              {pedidos.filter(p => p.status === "Entregado").length}
            </p>
          </div>
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-6">
            <p className="text-sm font-medium text-orange-200">Pendientes</p>
            <p className="mt-3 text-4xl font-bold text-orange-300">
              {pedidos.filter(p => p.status === "Pendiente").length}
            </p>
          </div>
        </div>

        {/* Mis Pedidos */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">Mis Pedidos</h3>
          
          {pedidos.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-12 text-center">
              <p className="text-slate-400">Aún no tienes pedidos</p>
              <Link
                href="/catalogo"
                className="mt-4 inline-block px-6 py-3 bg-amber-300 text-slate-900 font-semibold rounded-lg hover:bg-amber-200 transition"
              >
                Ir al Catálogo
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {pedidos.map((pedido) => (
                <div
                  key={pedido.id}
                  className="rounded-lg border border-white/10 bg-slate-900/50 p-6 hover:bg-slate-900/70 transition"
                >
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-slate-400">Productos</p>
                      <div className="mt-2 space-y-1">
                        {pedido.items.map((item, idx) => (
                          <div key={idx} className="text-sm">
                            <p className="font-semibold text-white">{item.productName}</p>
                            <p className="text-slate-400">
                              {item.material} • {item.quantity}x ${item.price}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Total</p>
                      <p className="mt-1 text-2xl font-bold text-amber-300">${pedido.totalPrice}</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Estado</p>
                        <p
                          className={`mt-1 px-3 py-1 rounded-full text-sm font-semibold w-fit ${
                            pedido.status === "Pendiente"
                              ? "bg-orange-500/20 text-orange-300"
                              : pedido.status === "Confirmado"
                              ? "bg-blue-500/20 text-blue-300"
                              : pedido.status === "Enviado"
                              ? "bg-purple-500/20 text-purple-300"
                              : pedido.status === "Entregado"
                              ? "bg-green-500/20 text-green-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {pedido.status}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500">
                        {new Date(pedido.createdAt).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mi Información - Editable */}
        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Mi Información</h3>
            <button
              onClick={() => {
                setEditando(!editando);
                setError("");
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                editando
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-amber-300 text-slate-900 hover:bg-amber-200"
              }`}
            >
              {editando ? "Cancelar" : "✏️ Editar"}
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {exito && (
            <div className="mb-4 rounded-lg bg-green-500/10 border border-green-500/30 p-3">
              <p className="text-sm text-green-200">{exito}</p>
            </div>
          )}

          {editando ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  placeholder="Ej: Bogotá"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Dirección de Entrega
                </label>
                <input
                  type="text"
                  name="direccionEntrega"
                  value={formData.direccionEntrega}
                  onChange={handleChange}
                  placeholder="Ej: Calle 123 #45-67"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300/50"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleGuardarCambios}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-400">Nombre</p>
                <p className="mt-1 text-white font-medium">{cliente?.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Email</p>
                <p className="mt-1 text-white font-medium">{cliente?.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Teléfono</p>
                <p className="mt-1 text-white font-medium">{cliente?.telefono || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Ciudad</p>
                <p className="mt-1 text-white font-medium">{cliente?.ciudad || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Dirección de Entrega</p>
                <p className="mt-1 text-white font-medium">{cliente?.direccionEntrega || "No especificado"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="mt-8 flex gap-4">
          <Link
            href="/catalogo"
            className="px-6 py-3 bg-amber-300 text-slate-900 font-semibold rounded-lg hover:bg-amber-200 transition"
          >
            Continuar Comprando
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition"
          >
            Volver a Inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
