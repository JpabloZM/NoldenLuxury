"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const clientes = JSON.parse(localStorage.getItem("clientes") || "[]");
      const cliente = clientes.find(
        (c: any) => c.email === email && c.password === password,
      );

      if (!cliente) {
        setError("Email o contraseña incorrectos");
        setLoading(false);
        return;
      }

      localStorage.setItem("clienteToken", cliente.id);
      localStorage.setItem("clienteEmail", cliente.email);
      router.push("/");
    } catch (err) {
      setError("Error al iniciar sesión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-8 backdrop-blur">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">Nolden Luxury</h1>
            <p className="mt-2 text-sm text-amber-200">
              Inicia sesión en tu cuenta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300/50"
                required
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
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300/50"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-amber-300 px-4 py-2.5 font-semibold text-slate-900 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300/50 disabled:opacity-50"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            ¿No tienes cuenta?{" "}
            <Link
              href="/auth/register"
              className="text-amber-300 hover:text-amber-200"
            >
              Regístrate aquí
            </Link>
          </p>

          <Link
            href="/"
            className="mt-4 block text-center text-xs text-slate-500 hover:text-slate-400"
          >
            Volver a inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
