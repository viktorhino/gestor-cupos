import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "./config";

export function createClient() {
  console.log("Supabase Config:", {
    url: supabaseConfig.url,
    anonKey: supabaseConfig.anonKey ? "Presente" : "Faltante",
  });

  // Usar la configuración robusta
  const url = supabaseConfig.url;
  const anonKey = supabaseConfig.anonKey;

  if (!url || !anonKey) {
    console.warn("Supabase configuration missing, using defaults");
  }

  return createBrowserClient(url, anonKey);
}

// Exportar una instancia por defecto para compatibilidad
export const supabase = createClient();
