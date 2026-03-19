"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import type { DashboardStats } from "@/app/lib/admin-types";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 6,
    totalOrders: 0,
    totalContacts: 0,
    lowInventoryItems: 2,
    pendingOrders: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin/login");
    }
  }, [router]);

  return (
    <AdminLayout>
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">
          Bienvenido al panel de administración Nolden Luxury
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Card: Total Productos */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-6">
            <p className="text-sm font-medium text-blue-200">
              Total de Productos
            </p>
            <p className="mt-3 text-4xl font-bold text-white">
              {stats.totalProducts}
            </p>
            <p className="mt-2 text-xs text-blue-300">En catálogo</p>
          </div>

          {/* Card: Pedidos Pendientes */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-orange-500/10 to-orange-600/10 p-6">
            <p className="text-sm font-medium text-orange-200">
              Pedidos Pendientes
            </p>
            <p className="mt-3 text-4xl font-bold text-white">
              {stats.pendingOrders}
            </p>
            <p className="mt-2 text-xs text-orange-300">Por confirmar</p>
          </div>

          {/* Card: Mensajes de Contacto */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-green-500/10 to-green-600/10 p-6">
            <p className="text-sm font-medium text-green-200">Mensajes</p>
            <p className="mt-3 text-4xl font-bold text-white">
              {stats.totalContacts}
            </p>
            <p className="mt-2 text-xs text-green-300">Contactos recibidos</p>
          </div>

          {/* Card: Bajo Inventario */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-red-500/10 to-red-600/10 p-6">
            <p className="text-sm font-medium text-red-200">Bajo Inventario</p>
            <p className="mt-3 text-4xl font-bold text-white">
              {stats.lowInventoryItems}
            </p>
            <p className="mt-2 text-xs text-red-300">Productos críticos</p>
          </div>
        </div>

        {/* Charts and Statistics */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Gráficos y Estadísticas
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {/* Chart Placeholder 1 */}
            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-6 min-h-96">
              <h3 className="font-semibold text-white mb-4">
                Ventas Mensuales
              </h3>
              <div className="flex items-center justify-center h-72 border border-dashed border-white/20 rounded-lg">
                <p className="text-slate-400">Gráfico de ventas aquí</p>
              </div>
            </div>

            {/* Chart Placeholder 2 */}
            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-6 min-h-96">
              <h3 className="font-semibold text-white mb-4">
                Productos Más Vendidos
              </h3>
              <div className="flex items-center justify-center h-72 border border-dashed border-white/20 rounded-lg">
                <p className="text-slate-400">Gráfico de productos aquí</p>
              </div>
            </div>

            {/* Chart Placeholder 3 */}
            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-6 min-h-96">
              <h3 className="font-semibold text-white mb-4">
                Actividad Reciente
              </h3>
              <div className="flex items-center justify-center h-72 border border-dashed border-white/20 rounded-lg">
                <p className="text-slate-400">Gráfico de actividad aquí</p>
              </div>
            </div>

            {/* Chart Placeholder 4 */}
            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-6 min-h-96">
              <h3 className="font-semibold text-white mb-4">
                Distribución de Inventario
              </h3>
              <div className="flex items-center justify-center h-72 border border-dashed border-white/20 rounded-lg">
                <p className="text-slate-400">Gráfico de inventario aquí</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
