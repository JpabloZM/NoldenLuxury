"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createCustomer } from "@/app/lib/customers-operations";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    departamento: "",
    ciudad: "",
    codigoPostal: "",
    direccionEntrega: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (
      !formData.nombre ||
      !formData.email ||
      !formData.password ||
      !formData.ciudad ||
      !formData.direccionEntrega
    ) {
      setError("Por favor completa todos los campos requeridos");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      // Verificar si email ya existe
      const clientes = JSON.parse(localStorage.getItem("clientes") || "[]");
      if (clientes.some((c: any) => c.email === formData.email)) {
        setError("Este email ya está registrado");
        setLoading(false);
        return;
      }

      // Crear nuevo cliente
      const nuevoCliente = {
        id: `cliente-${Date.now()}`,
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password, // En producción: hashear
        telefono: formData.telefono,
        departamento: formData.departamento,
        ciudad: formData.ciudad,
        codigoPostal: formData.codigoPostal,
        direccionEntrega: formData.direccionEntrega,
        createdAt: new Date().toISOString(),
      };

      clientes.push(nuevoCliente);
      localStorage.setItem("clientes", JSON.stringify(clientes));

      // Crear también en Supabase para que aparezca en admin/clientes
      try {
        await createCustomer({
          name: formData.nombre,
          email: formData.email,
          phone: formData.telefono,
          address: formData.direccionEntrega,
          city: formData.ciudad,
          state: formData.departamento,
          zip_code: formData.codigoPostal,
          notes: "",
          source: "registered",
        });
      } catch (supabaseError) {
        console.warn(
          "Cliente guardado localmente pero no en Supabase:",
          supabaseError,
        );
        // No bloqueamos el registro si falla Supabase
      }

      // Login automático
      localStorage.setItem("clienteToken", nuevoCliente.id);
      localStorage.setItem("clienteEmail", nuevoCliente.email);

      router.push("/cliente/dashboard");
    } catch (err) {
      setError("Error al registrarse. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-8 backdrop-blur">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">ARNOLUX</h1>
            <p className="mt-2 text-sm text-amber-200">Crea tu cuenta</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            autoComplete="off"
          >
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                autoComplete="off"
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="off"
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Teléfono (Opcional)
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                autoComplete="off"
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Departamento/Estado
              </label>
              <input
                type="text"
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                placeholder="Ej: Cundinamarca, Antioquia"
                autoComplete="off"
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300/50"
                required
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
                placeholder="Ej: Bogotá, Medellín"
                autoComplete="off"
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Código Postal
              </label>
              <input
                type="text"
                name="codigoPostal"
                value={formData.codigoPostal}
                onChange={handleChange}
                placeholder="Ej: 110111"
                autoComplete="off"
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300/50"
                required
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
                placeholder="Ej: Calle 123 #45-67, Apto 8B"
                autoComplete="off"
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
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
              disabled={loading}
              className="w-full rounded-lg bg-amber-300 px-4 py-2.5 font-semibold text-slate-900 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300/50 disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Registrarse"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/auth/login"
              className="text-amber-300 hover:text-amber-200"
            >
              Inicia sesión aquí
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
