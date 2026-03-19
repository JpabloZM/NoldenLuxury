"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import type { Contact } from "@/app/lib/admin-types";

export default function ClientesPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    const stored = localStorage.getItem("adminContacts");
    if (stored) {
      setContacts(JSON.parse(stored));
    }
  }, [router]);

  const updateContactStatus = (id: string, newStatus: Contact["status"]) => {
    const updated = contacts.map((c) =>
      c.id === id ? { ...c, status: newStatus } : c,
    );
    setContacts(updated);
    localStorage.setItem("adminContacts", JSON.stringify(updated));
    if (selectedContact?.id === id) {
      setSelectedContact({ ...selectedContact, status: newStatus });
    }
  };

  const deleteContact = (id: string) => {
    if (confirm("¿Eliminar este contacto?")) {
      const updated = contacts.filter((c) => c.id !== id);
      setContacts(updated);
      localStorage.setItem("adminContacts", JSON.stringify(updated));
      setSelectedContact(null);
    }
  };

  const unread = contacts.filter((c) => c.status === "No leído");
  const read = contacts.filter((c) => c.status === "Leído");
  const responded = contacts.filter((c) => c.status === "Respondido");

  return (
    <AdminLayout>
      <div>
        <h1 className="text-4xl font-bold text-white mb-8">
          Gestión de Clientes
        </h1>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-xs font-medium text-red-200">No Leídos</p>
            <p className="mt-2 text-2xl font-bold text-red-300">
              {unread.length}
            </p>
          </div>
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
            <p className="text-xs font-medium text-yellow-200">Leídos</p>
            <p className="mt-2 text-2xl font-bold text-yellow-300">
              {read.length}
            </p>
          </div>
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
            <p className="text-xs font-medium text-green-200">Respondidos</p>
            <p className="mt-2 text-2xl font-bold text-green-300">
              {responded.length}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Lista de contactos */}
          <div className="md:col-span-1">
            <div className="rounded-xl border border-white/10 bg-slate-900/50 overflow-hidden">
              <div className="border-b border-white/10 px-4 py-3 bg-slate-900">
                <h2 className="font-semibold text-white">
                  Contactos ({contacts.length})
                </h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {contacts.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-sm">
                    No hay contactos aún
                  </div>
                ) : (
                  contacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`w-full text-left px-4 py-3 border-b border-white/5 transition ${
                        selectedContact?.id === contact.id
                          ? "bg-amber-300/20 border-l-2 border-l-amber-300"
                          : "hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">
                            {contact.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {contact.email}
                          </p>
                        </div>
                        <span
                          className={`ml-2 text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
                            contact.status === "No leído"
                              ? "bg-red-500/20 text-red-300"
                              : contact.status === "Leído"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : "bg-green-500/20 text-green-300"
                          }`}
                        >
                          {contact.status === "No leído" ? "●" : "✓"}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Detalle de contacto */}
          <div className="md:col-span-2">
            {selectedContact ? (
              <div className="rounded-xl border border-white/10 bg-slate-900/50 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">
                      {selectedContact.name}
                    </h2>
                    <p className="text-slate-400 text-sm">
                      {selectedContact.email}
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      {new Date(selectedContact.createdAt).toLocaleDateString(
                        "es-ES",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>
                  <select
                    value={selectedContact.status}
                    onChange={(e) =>
                      updateContactStatus(
                        selectedContact.id,
                        e.target.value as Contact["status"],
                      )
                    }
                    className={`rounded-lg px-3 py-2 text-sm font-medium outline-none ${
                      selectedContact.status === "No leído"
                        ? "bg-red-500/20 text-red-300 border border-red-500/50"
                        : selectedContact.status === "Leído"
                          ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/50"
                          : "bg-green-500/20 text-green-300 border border-green-500/50"
                    }`}
                  >
                    <option>No leído</option>
                    <option>Leído</option>
                    <option>Respondido</option>
                  </select>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold text-white mb-3">Mensaje:</h3>
                  <div className="rounded-lg bg-slate-800/50 p-4 border border-white/10">
                    <p className="text-slate-300 whitespace-pre-wrap">
                      {selectedContact.message}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition text-center"
                  >
                    Responder por Email
                  </a>
                  <a
                    href={`https://wa.me/?text=Hola%20${encodeURIComponent(selectedContact.name)}%2C%20recibimos%20tu%20mensaje`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition text-center"
                  >
                    Responder por WhatsApp
                  </a>
                  <button
                    onClick={() => deleteContact(selectedContact.id)}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-slate-900/50 p-12 text-center">
                <p className="text-slate-400">
                  Selecciona un contacto para ver los detalles
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
