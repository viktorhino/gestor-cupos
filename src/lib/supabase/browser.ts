import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "./config";

export function createClient() {
  console.log("Supabase Config:", {
    url: supabaseConfig.url,
    anonKey: supabaseConfig.anonKey ? "Presente" : "Faltante",
  });

  // Usar valores por defecto para desarrollo si no están configurados
  const url = supabaseConfig.url || "https://placeholder.supabase.co";
  const anonKey = supabaseConfig.anonKey || "placeholder-key";

  return createBrowserClient(url, anonKey);
}

// Exportar una instancia por defecto para compatibilidad
export const supabase = createClient();
