import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "./config";

export function createClient() {
  // Configuración de Supabase (logs removidos para limpiar consola)

  // Usar la configuración robusta
  const url = supabaseConfig.url;
  const anonKey = supabaseConfig.anonKey;
  const schema = supabaseConfig.schema;

  if (!url || !anonKey) {
    console.warn("Supabase configuration missing, using defaults");
  }

  return createBrowserClient(url, anonKey, {
    db: {
      schema: schema,
    },
  });
}

// Exportar una instancia por defecto para compatibilidad
export const supabase = createClient();
