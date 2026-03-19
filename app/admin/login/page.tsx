"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validación básica (en producción: integrar con backend)
    if (email === "admin@arnolux.com" && password === "arnolux2026") {
      localStorage.setItem("adminToken", "authenticated");
      localStorage.setItem("adminEmail", email);
      router.push("/admin/dashboard");
    } else {
      setError("Email o contraseña incorrectos");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-8 backdrop-blur">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">ARNOLUX</h1>
            <p className="mt-2 text-sm text-amber-200">
              Panel de Administración
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@arnolux.com"
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300/50"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-amber-300 px-4 py-2.5 font-semibold text-slate-900 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300/50"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-slate-800/50 p-4">
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Demo:</span>
              <br />
              Email: admin@arnolux.com
              <br />
              Contraseña: arnolux2026
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
