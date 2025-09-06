"use client";

import { useJobs } from "@/lib/hooks/use-jobs";
import { jobService } from "@/lib/services/jobs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugJobsPage() {
  const { jobs, loading, error, refreshJobs } = useJobs();

  const createTestJob = async () => {
    try {
      // Crear un trabajo de prueba
      const job = await jobService.createJob({
        client_id: "test-client-id", // Necesitarás un ID de cliente válido
        tipo: "tarjetas",
        notas: "Trabajo de prueba",
      });

      if (job) {
        console.log("Trabajo creado:", job);
        await refreshJobs();
      }
    } catch (error) {
      console.error("Error creando trabajo de prueba:", error);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Debug - Trabajos</h1>

      <Card>
        <CardHeader>
          <CardTitle>Estado de la Conexión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Loading:</strong> {loading ? "Sí" : "No"}
          </div>
          <div>
            <strong>Error:</strong> {error || "Ninguno"}
          </div>
          <div>
            <strong>Cantidad de trabajos:</strong> {jobs.length}
          </div>
          <Button onClick={refreshJobs}>Refrescar Trabajos</Button>
          <Button onClick={createTestJob} variant="outline">
            Crear Trabajo de Prueba
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos de Trabajos</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(jobs, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}



