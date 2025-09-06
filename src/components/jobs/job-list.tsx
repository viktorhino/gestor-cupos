"use client";

import { useJobs } from "@/lib/hooks/use-jobs";
import { JobTable } from "./job-table";
import { Package } from "lucide-react";
import { JobWithDetails } from "@/lib/types/database";

interface JobListProps {
  searchTerm: string;
  onEditJob: (job: JobWithDetails) => void;
  onDeleteJob: (job: JobWithDetails) => void;
  onViewJob: (job: JobWithDetails) => void;
  onAddPayment?: (job: JobWithDetails) => void;
  onJobUpdate?: (job: JobWithDetails) => void;
}

export function JobList({
  searchTerm,
  onEditJob,
  onDeleteJob,
  onViewJob,
  onAddPayment,
  onJobUpdate,
}: JobListProps) {
  const { jobs, loading, error } = useJobs();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando trabajos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive mb-4">
          <Package className="h-12 w-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Error al cargar trabajos</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Filtrar trabajos por término de búsqueda
  const filteredJobs = jobs.filter((job) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      job.client?.nombre?.toLowerCase().includes(searchLower) ||
      job.nombre_trabajo?.toLowerCase().includes(searchLower) ||
      job.id.toLowerCase().includes(searchLower)
    );
  });

  // Agrupar trabajos por tipo - lógica actualizada para estructura consolidada
  const groupedJobs = {
    brillo: filteredJobs.filter((job) => {
      // Si es tarjetas y tiene card_reference con grupo brillo
      if (job.tipo === "tarjetas" && job.card_reference?.grupo === "brillo") {
        return true;
      }
      // Si es tarjetas pero no tiene card_reference, asumir brillo por defecto
      return job.tipo === "tarjetas" && !job.card_reference;
    }),
    mateReserva: filteredJobs.filter((job) => {
      // Si es tarjetas y tiene card_reference con grupo mate_reserva
      return (
        job.tipo === "tarjetas" && job.card_reference?.grupo === "mate_reserva"
      );
    }),
    volantes: filteredJobs.filter((job) => job.tipo === "volantes"),
  };

  // Calcular total de cupos por grupo - lógica actualizada para estructura consolidada
  const calculateTotalCupos = (jobs: typeof filteredJobs) => {
    return jobs.reduce((total, job) => {
      // Usar los campos consolidados directamente de la tabla jobs
      const jobCupos = (job.ocupacion_cupo || 0) * (job.cantidad_millares || 0);
      return total + jobCupos;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Tarjetas Brillo */}
      {groupedJobs.brillo.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-blue-600">
            Tarjetas Brillo ({calculateTotalCupos(groupedJobs.brillo)} cupos)
          </h3>
          <JobTable
            jobs={groupedJobs.brillo}
            onEditJob={onEditJob}
            onDeleteJob={onDeleteJob}
            onViewJob={onViewJob}
            onAddPayment={onAddPayment}
            onJobUpdate={onJobUpdate}
          />
        </div>
      )}

      {/* Tarjetas Mate-Reserva */}
      {groupedJobs.mateReserva.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-600">
            Tarjetas Mate-Reserva (
            {calculateTotalCupos(groupedJobs.mateReserva)} cupos)
          </h3>
          <JobTable
            jobs={groupedJobs.mateReserva}
            onEditJob={onEditJob}
            onDeleteJob={onDeleteJob}
            onViewJob={onViewJob}
            onAddPayment={onAddPayment}
            onJobUpdate={onJobUpdate}
          />
        </div>
      )}

      {/* Volantes */}
      {groupedJobs.volantes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-orange-600">
            Volantes ({calculateTotalCupos(groupedJobs.volantes)} cupos)
          </h3>
          <JobTable
            jobs={groupedJobs.volantes}
            onEditJob={onEditJob}
            onDeleteJob={onDeleteJob}
            onViewJob={onViewJob}
            onAddPayment={onAddPayment}
            onJobUpdate={onJobUpdate}
          />
        </div>
      )}

      {/* Sin trabajos */}
      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay trabajos</h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? "No se encontraron trabajos que coincidan con tu búsqueda"
              : "Aún no has recibido ningún trabajo"}
          </p>
        </div>
      )}
    </div>
  );
}
