import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "./config";

export function createClient() {
  console.log("Supabase Config:", {
    url: supabaseConfig.url,
    anonKey: supabaseConfig.anonKey ? "Presente" : "Faltante",
  });

  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    throw new Error(
      "Supabase configuration is missing. Please check your .env.local file."
    );
  }

  return createBrowserClient(supabaseConfig.url, supabaseConfig.anonKey);
}
