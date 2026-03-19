"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { contarItems } from "@/app/lib/carrito-utils";

export default function Header() {
  const router = useRouter();
  const [itemsEnCarrito, setItemsEnCarrito] = useState(0);
  const [clienteToken, setClienteToken] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [clienteNombre, setClienteNombre] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("clienteToken");
    const admin = localStorage.getItem("adminToken");
    setClienteToken(token);
    setAdminToken(admin);

    if (token) {
      const clientes = JSON.parse(localStorage.getItem("clientes") || "[]");
      const cliente = clientes.find((c: any) => c.id === token);
      if (cliente) {
        setClienteNombre(cliente.nombre);
      }
    }

    const handleStorageChange = () => {
      const updatedItems = contarItems();
      setItemsEnCarrito(updatedItems);
    };

    // Initial count
    handleStorageChange();

    // Listen for storage changes
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("clienteToken");
    localStorage.removeItem("clienteEmail");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    router.push("/");
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
        <div className="h-16 w-16 relative rounded-full overflow-hidden border-2 border-amber-300">
          <Image
            src="/logo.1 arnolux.jpeg"
            alt="ARNOLUX Logo"
            fill
            className="object-cover"
            priority
          />
        </div>
        <nav className="hidden gap-6 text-sm md:flex">
          <a href="#catalogo" className="text-slate-300 hover:text-white">
            Catálogo
          </a>
          <a href="#materiales" className="text-slate-300 hover:text-white">
            Materiales
          </a>
          <a href="#beneficios" className="text-slate-300 hover:text-white">
            Beneficios
          </a>
          <a href="#contacto" className="text-slate-300 hover:text-white">
            Contacto
          </a>
        </nav>
        <div className="flex items-center gap-3">
          {clienteToken && (
            <Link
              href="/carrito"
              className="relative px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition"
            >
              🛒 Carrito
              {itemsEnCarrito > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-300 text-slate-900 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {itemsEnCarrito}
                </span>
              )}
            </Link>
          )}

          {clienteToken ? (
            <div className="relative group">
              <button className="px-4 py-2 bg-amber-300 text-slate-900 text-sm font-semibold rounded-lg hover:bg-amber-200 transition">
                👤 {clienteNombre || "Mi Perfil"}
              </button>
              <div className="absolute right-0 mt-0 w-48 bg-slate-900 border border-white/10 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link
                  href="/cliente/dashboard"
                  className="block px-4 py-2.5 text-white text-sm hover:bg-slate-800 rounded-t-lg"
                >
                  Ver Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-white text-sm hover:bg-slate-800 rounded-b-lg border-t border-white/10"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : adminToken ? (
            <div className="relative group">
              <button className="px-4 py-2 bg-amber-300 text-slate-900 text-sm font-semibold rounded-lg hover:bg-amber-200 transition">
                🔐 Admin
              </button>
              <div className="absolute right-0 mt-0 w-48 bg-slate-900 border border-white/10 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link
                  href="/admin/dashboard"
                  className="block px-4 py-2.5 text-white text-sm hover:bg-slate-800 rounded-t-lg"
                >
                  Panel Admin
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-white text-sm hover:bg-slate-800 rounded-b-lg border-t border-white/10"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-amber-300 text-slate-900 text-sm font-semibold rounded-lg hover:bg-amber-200 transition"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
