"use client";

import { useState } from "react";
import { Toast } from "./Toast";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setToast({
          type: "success",
          message: "¡Mensaje enviado correctamente! Nos pondremos en contacto pronto.",
        });
        // Limpiar formulario
        setFormData({
          nombre: "",
          email: "",
          mensaje: "",
        });
      } else {
        setToast({
          type: "error",
          message: data.error || "Error al enviar el mensaje",
        });
      }
    } catch (error) {
      setToast({
        type: "error",
        message: "Error al enviar el mensaje. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-slate-950 p-6">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none ring-amber-300/40 placeholder:text-slate-500 focus:ring"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none ring-amber-300/40 placeholder:text-slate-500 focus:ring"
        />
        <textarea
          name="mensaje"
          placeholder="¿Qué piezas buscas? (aretes, cadenas, anillos, etc.)"
          rows={4}
          value={formData.mensaje}
          onChange={handleChange}
          required
          className="w-full resize-none rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none ring-amber-300/40 placeholder:text-slate-500 focus:ring"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Enviando..." : "Solicitar catálogo"}
        </button>
      </form>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
