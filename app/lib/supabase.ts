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
