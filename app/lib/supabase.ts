import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug logging
if (typeof window !== "undefined") {
  console.log(
    "Supabase URL:",
    supabaseUrl ? "✓ Configurada" : "✗ No configurada",
  );
  console.log(
    "Supabase Key:",
    supabaseAnonKey ? "✓ Configurada" : "✗ No configurada",
  );
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Variables de entorno de Supabase no encontradas. Verifica .env.local",
  );
  // No lanzar error en build time, dejar que falle en runtime
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

// Cliente para operaciones del servidor (API routes)
// 🔒 IMPORTANTE: El SERVICE_ROLE_KEY solo se usa en el servidor, NUNCA en el cliente
export const supabaseServer = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "❌ SUPABASE_SERVICE_ROLE_KEY no está configurada en .env.local\n" +
        "Ve a Supabase Dashboard → Settings → API → Service Role Secret\n" +
        "y agrégala a tu .env.local",
    );
  }

  return createClient(supabaseUrl || "", serviceRoleKey);
};
