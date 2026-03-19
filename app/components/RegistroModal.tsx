"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function RegistroModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Mostrar modal si no ha sido cerrado en esta sesión
    const hasClosedModal = sessionStorage.getItem("registroModalClosed");
    if (!hasClosedModal) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000); // Esperar 2 segundos
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("registroModalClosed", "true");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="rounded-2xl border border-amber-300/30 bg-gradient-to-br from-slate-900 to-slate-950 p-8 max-w-md">
        <div className="text-center mb-6">
          <p className="text-amber-300 font-semibold text-sm">💡 Recomendación</p>
          <h3 className="text-2xl font-bold text-white mt-2">
            Mejor control de tus compras
          </h3>
        </div>

        <p className="text-slate-300 text-center mb-6">
          Para un mejor manejo de tus pedidos y mantener tu información personal segura, 
          te recomendamos que <span className="font-semibold text-amber-300">crees una cuenta</span>.
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex gap-3">
            <span className="text-amber-300 font-bold text-lg">✓</span>
            <div>
              <p className="font-semibold text-white text-sm">Historial de compras</p>
              <p className="text-slate-400 text-xs">Ve todos tus pedidos en un lugar</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-amber-300 font-bold text-lg">✓</span>
            <div>
              <p className="font-semibold text-white text-sm">Rastreo de pedidos</p>
              <p className="text-slate-400 text-xs">Sigue el estado de tu compra en tiempo real</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-amber-300 font-bold text-lg">✓</span>
            <div>
              <p className="font-semibold text-white text-sm">Información segura</p>
              <p className="text-slate-400 text-xs">Guarda tus datos para compras futuras</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/auth/register"
            onClick={handleClose}
            className="block w-full px-6 py-3 bg-amber-300 text-slate-900 font-semibold rounded-lg hover:bg-amber-200 transition text-center"
          >
            Registrarse Ahora
          </Link>
          <Link
            href="/auth/login"
            onClick={handleClose}
            className="block w-full px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition text-center"
          >
            Ya tengo cuenta
          </Link>
          <button
            onClick={handleClose}
            className="w-full px-6 py-3 bg-transparent text-slate-400 font-semibold rounded-lg hover:text-slate-300 transition"
          >
            Continuar sin registrarse
          </button>
        </div>
      </div>
    </div>
  );
}
