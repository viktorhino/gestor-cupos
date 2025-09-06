"use client";

import { JobWithDetails } from "@/lib/types/database";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { jobService } from "@/lib/services/jobs";
import { toast } from "sonner";
import { useState } from "react";

interface JobStatusSelectProps {
  job: JobWithDetails;
  onStatusChange?: (job: JobWithDetails) => void;
}

const statusConfig = {
  recibido: { variant: "default" as const, label: "Recibido" },
  en_preprensa: { variant: "secondary" as const, label: "En Preprensa" },
  pendiente_de_montaje: {
    variant: "outline" as const,
    label: "Pendiente de Montaje",
  },
  en_cupo: { variant: "secondary" as const, label: "En Cupo" },
  impreso: { variant: "outline" as const, label: "Impreso" },
  terminado: { variant: "outline" as const, label: "Terminado" },
  listo_para_entrega: {
    variant: "secondary" as const,
    label: "Listo para Entrega",
  },
  entregado: { variant: "secondary" as const, label: "Entregado" },
  cancelado: { variant: "destructive" as const, label: "Cancelado" },
};

export function JobStatusSelect({ job, onStatusChange }: JobStatusSelectProps) {
  const [isChanging, setIsChanging] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === job.estado) return;

    try {
      setIsChanging(true);
      const success = await jobService.updateJobStatus(job.id, newStatus);

      if (success) {
        toast.success("Estado actualizado exitosamente");

        // Crear un objeto actualizado para el callback
        const updatedJob = {
          ...job,
          estado: newStatus as any,
        };

        if (onStatusChange) {
          onStatusChange(updatedJob);
        }
      } else {
        toast.error("Error al actualizar el estado");
      }
    } catch (error) {
      console.error("Error updating job status:", error);
      toast.error("Error al actualizar el estado");
    } finally {
      setIsChanging(false);
    }
  };

  const currentConfig =
    statusConfig[job.estado as keyof typeof statusConfig] ||
    statusConfig.recibido;

  return (
    <div className="flex items-center gap-2">
      <Select
        value={job.estado}
        onValueChange={handleStatusChange}
        disabled={isChanging}
      >
        <SelectTrigger className="w-[180px] h-8">
          <SelectValue>
            <Badge variant={currentConfig.variant} className="text-xs">
              {currentConfig.label}
            </Badge>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(statusConfig).map(([status, config]) => (
            <SelectItem key={status} value={status}>
              <div className="flex items-center gap-2">
                <Badge variant={config.variant} className="text-xs">
                  {config.label}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}



