"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browser";

export default function SupabaseDebugPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>("Verificando...");
  const [tables, setTables] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Probar conexión básica
        const { data, error } = await supabase.from("clients").select("count").limit(1);
        
        if (error) {
          setConnectionStatus("❌ Error de conexión");
          setError(error.message);
        } else {
          setConnectionStatus("✅ Conexión exitosa");
          
          // Obtener lista de tablas
          const { data: tablesData, error: tablesError } = await supabase
            .from("information_schema.tables")
            .select("table_name")
            .eq("table_schema", "public");
            
          if (!tablesError && tablesData) {
            setTables(tablesData);
          }
        }
      } catch (err) {
        setConnectionStatus("❌ Error de conexión");
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>🔍 Diagnóstico de Supabase</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <h2>Estado de Conexión:</h2>
        <p style={{ fontSize: "18px", fontWeight: "bold" }}>{connectionStatus}</p>
      </div>

      {error && (
        <div style={{ marginBottom: "20px", padding: "10px", backgroundColor: "#fee", border: "1px solid #fcc" }}>
          <h3>❌ Error:</h3>
          <p>{error}</p>
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <h2>Configuración:</h2>
        <p><strong>URL:</strong> https://dabffkglfwdjfaanzpkm.supabase.co</p>
        <p><strong>Clave:</strong> {supabase.supabaseKey ? "Presente" : "Faltante"}</p>
      </div>

      {tables.length > 0 && (
        <div>
          <h2>Tablas disponibles:</h2>
          <ul>
            {tables.map((table, index) => (
              <li key={index}>{table.table_name}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#efe", border: "1px solid #cfc" }}>
        <h3>💡 Solución:</h3>
        <p>Si hay error de conexión, necesitas:</p>
        <ol>
          <li>Obtener la clave anon real de Supabase</li>
          <li>Actualizar el archivo <code>src/lib/supabase/config.ts</code></li>
          <li>Hacer commit y push de los cambios</li>
        </ol>
      </div>
    </div>
  );
}