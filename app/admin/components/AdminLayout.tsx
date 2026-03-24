"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminEmail, setAdminEmail] = useState("Administrador");

  useEffect(() => {
    const email = localStorage.getItem("adminEmail");
    if (email) {
      setAdminEmail(email);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    router.replace("/");
  };

  const isActive = (href: string) => pathname === href;

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/productos", label: "Productos" },
    { href: "/admin/materiales", label: "Materiales" },
    { href: "/admin/inventario", label: "Inventario" },
    { href: "/admin/pedidos", label: "Pedidos" },
    { href: "/admin/clientes", label: "Clientes" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-64 border-r border-white/10 bg-slate-900 overflow-y-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-amber-300">Nolden Luxury</h1>
          <p className="mt-1 text-xs text-slate-400">Panel Admin</p>
        </div>

        <nav className="space-y-1 px-4 py-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                isActive(item.href)
                  ? "bg-amber-300/20 text-amber-300 border-l-2 border-amber-300"
                  : "text-slate-300 hover:bg-slate-800/50"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            className="w-full rounded-lg bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <header className="border-b border-white/10 bg-slate-900/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Bienvenido,</p>
              <p className="font-semibold text-white">{adminEmail}</p>
            </div>
            <div className="text-xs text-slate-400">
              {new Date().toLocaleDateString("es-ES")}
            </div>
          </div>
        </header>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
