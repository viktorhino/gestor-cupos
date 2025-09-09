"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browser";

export default function DataDebugPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Obtener clientes
        const { data: clientsData, error: clientsError } = await supabase
          .from("clients")
          .select("*")
          .limit(10);

        if (clientsError) {
          setError(`Error clientes: ${clientsError.message}`);
          return;
        }

        // Obtener trabajos
        const { data: jobsData, error: jobsError } = await supabase
          .from("jobs")
          .select(
            `
            *,
            clients:client_id(empresa, encargado, tratamiento),
            job_items(
              *,
              card_references:card_reference_id(nombre, grupo),
              flyer_types:flyer_type_id(tamaño, modo)
            )
          `
          )
          .limit(10);

        if (jobsError) {
          setError(`Error trabajos: ${jobsError.message}`);
          return;
        }

        setClients(clientsData || []);
        setJobs(jobsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1>🔍 Verificando Datos...</h1>
        <p>Cargando información de la base de datos...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>🔍 Verificación de Datos</h1>

      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "10px",
            backgroundColor: "#fee",
            border: "1px solid #fcc",
          }}
        >
          <h3>❌ Error:</h3>
          <p>{error}</p>
        </div>
      )}

      <div style={{ marginBottom: "30px" }}>
        <h2>👥 Clientes ({clients.length})</h2>
        {clients.length === 0 ? (
          <p style={{ color: "#666" }}>No hay clientes en la base de datos</p>
        ) : (
          <div
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              border: "1px solid #ddd",
              padding: "10px",
            }}
          >
            {clients.map((client, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "10px",
                  padding: "5px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <strong>ID:</strong> {client.id} |<strong> Empresa:</strong>{" "}
                {client.empresa} |<strong> Encargado:</strong>{" "}
                {client.encargado}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h2>📋 Trabajos ({jobs.length})</h2>
        {jobs.length === 0 ? (
          <p style={{ color: "#666" }}>No hay trabajos en la base de datos</p>
        ) : (
          <div
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              border: "1px solid #ddd",
              padding: "10px",
            }}
          >
            {jobs.map((job, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "10px",
                  padding: "5px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <strong>ID:</strong> {job.id} |<strong> Consecutivo:</strong>{" "}
                {job.consecutivo} |<strong> Tipo:</strong> {job.tipo} |
                <strong> Estado:</strong> {job.estado}
                {job.clients && (
                  <span>
                    {" "}
                    | <strong>Cliente:</strong> {job.clients.empresa}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          padding: "10px",
          backgroundColor: "#efe",
          border: "1px solid #cfc",
        }}
      >
        <h3>💡 Diagnóstico:</h3>
        <ul>
          <li>
            Si no hay datos, necesitas agregar algunos registros de prueba
          </li>
          <li>
            Si hay datos pero la app no los muestra, el problema está en los
            componentes
          </li>
          <li>
            Si hay error, necesitamos revisar la configuración de RLS en
            Supabase
          </li>
        </ul>
      </div>
    </div>
  );
}
