import { redirect } from "next/navigation";

export default function AdminPage() {
  // En producción: verificar sesión
  // Por ahora, redirigir al login
  redirect("/admin/login");
}
