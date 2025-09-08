"use client";

import React from "react";
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
import { whatsappService } from "@/lib/services/whatsapp-service";
import { shouldGenerateMessage } from "@/lib/services/whatsapp-messages";
import { toast } from "sonner";
import { useState } from "react";

interface JobStatusSelectProps {
  job: JobWithDetails;
  onStatusChange?: (job: JobWithDetails) => void;
}

const statusConfig = {
  recibido: { variant: "default" as const, label: "Recibido" },
  procesando: { variant: "secondary" as const, label: "Procesando" },
  finalizado: { variant: "outline" as const, label: "Finalizado" },
  montado: { variant: "secondary" as const, label: "Montado" },
  delegado: { variant: "outline" as const, label: "Delegado" },
  impreso: { variant: "secondary" as const, label: "Impreso" },
  empacado: { variant: "outline" as const, label: "Empacado" },
  entregado: { variant: "secondary" as const, label: "Entregado" },
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

        // Generar mensaje WhatsApp si es necesario
        if (shouldGenerateMessage(newStatus)) {
          try {
            // Obtener el trabajo completo con todas las relaciones
            const fullJob = await jobService.getJobById(job.id);
            if (fullJob) {
              // Actualizar el estado en el trabajo completo
              const jobWithNewStatus = {
                ...fullJob,
                estado: newStatus as any,
              };

              const message = await whatsappService.processStateChange(
                jobWithNewStatus,
                newStatus
              );

              if (message) {
                toast.success("Mensaje WhatsApp generado");
              }
            }
          } catch (error) {
            console.error("Error generating WhatsApp message:", error);
            toast.error("Estado actualizado, pero error al generar mensaje");
          }
        }

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
