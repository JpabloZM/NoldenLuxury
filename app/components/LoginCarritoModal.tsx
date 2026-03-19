"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginCarritoModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  const handleRegistrarse = () => {
    router.push("/auth/register");
  };

  const handleIniciarSesion = () => {
    router.push("/login?type=cliente");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="rounded-2xl border border-amber-300/30 bg-gradient-to-br from-slate-900 to-slate-950 p-8 max-w-md">
        <div className="text-center mb-6">
          <p className="text-amber-300 font-semibold text-sm">🛒 Para Agregar al Carrito</p>
          <h3 className="text-2xl font-bold text-white mt-2">
            Debes tener una cuenta
          </h3>
        </div>

        <p className="text-slate-300 text-center mb-6">
          Es necesario que te <span className="font-semibold text-amber-300">registres o inicies sesión</span> para 
          agregar productos a tu carrito y realizar compras.
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex gap-3">
            <span className="text-amber-300 font-bold text-lg">✓</span>
            <div>
              <p className="font-semibold text-white text-sm">Carrito sincronizado</p>
              <p className="text-slate-400 text-xs">Tus productos siempre disponibles</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-amber-300 font-bold text-lg">✓</span>
            <div>
              <p className="font-semibold text-white text-sm">Pago y envío</p>
              <p className="text-slate-400 text-xs">Información guardada y segura</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-amber-300 font-bold text-lg">✓</span>
            <div>
              <p className="font-semibold text-white text-sm">Historial de compras</p>
              <p className="text-slate-400 text-xs">Rastreo de todos tus pedidos</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRegistrarse}
            className="w-full px-6 py-3 bg-amber-300 text-slate-900 font-semibold rounded-lg hover:bg-amber-200 transition"
          >
            Crear Cuenta
          </button>
          <button
            onClick={handleIniciarSesion}
            className="w-full px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition"
          >
            Iniciar Sesión
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 px-6 py-2 text-xs text-slate-500 hover:text-slate-400"
        >
          ← Volver
        </button>
      </div>
    </div>
  );
}
