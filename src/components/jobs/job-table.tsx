"use client";

import React from "react";
import { JobWithDetails } from "@/lib/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  Edit,
  Trash2,
  Package,
  CreditCard,
  CheckCircle,
  AlertCircle,
  XCircle,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { JobStatusSelect } from "./job-status-select";
import { calculatePaymentStatus } from "@/lib/services/jobs";
import { WhatsAppButton } from "@/components/whatsapp/whatsapp-button";
import { MessageHistory } from "@/components/whatsapp/message-history";

interface JobTableProps {
  jobs: JobWithDetails[];
  onEditJob: (job: JobWithDetails) => void;
  onDeleteJob: (job: JobWithDetails) => void;
  onViewJob: (job: JobWithDetails) => void;
  onAddPayment?: (job: JobWithDetails) => void;
  onJobUpdate?: (job: JobWithDetails) => void;
}

export function JobTable({
  jobs,
  onEditJob,
  onDeleteJob,
  onViewJob,
  onAddPayment,
  onJobUpdate,
}: JobTableProps) {
  const getStatusBadge = (status: string) => {
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

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.recibido;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No hay trabajos</h3>
        <p className="text-muted-foreground">
          No se encontraron trabajos en esta categoría
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="h-6 bg-gray-100">
            <TableHead className="py-1 text-xs font-semibold">
              Cliente
            </TableHead>
            <TableHead className="py-1 text-xs font-semibold">
              Nombre Trabajo
            </TableHead>
            <TableHead className="py-1 text-xs font-semibold">
              Fecha Recepción
            </TableHead>
            <TableHead className="text-center py-1 text-xs font-semibold">
              Cupos
            </TableHead>
            <TableHead className="py-1 text-xs font-semibold">Estado</TableHead>
            <TableHead className="text-center py-1 text-xs font-semibold">
              Pago
            </TableHead>
            <TableHead className="text-center py-1 text-xs font-semibold">
              WhatsApp
            </TableHead>
            <TableHead className="text-center w-[200px] py-1 text-xs font-semibold">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id} className="hover:bg-muted/50 h-6">
              <TableCell className="py-1">
                <span className="font-medium text-sm">
                  {job.client?.nombre || "Sin cliente"}
                </span>
              </TableCell>
              <TableCell className="py-1">
                <div className="font-medium text-sm">
                  {job.nombre_trabajo || "Sin nombre"}
                </div>
              </TableCell>
              <TableCell className="py-1">
                <div className="text-xs">
                  {format(new Date(job.fecha_recepcion), "dd MMM yyyy, HH:mm", {
                    locale: es,
                  })}
                </div>
              </TableCell>
              <TableCell className="text-center py-1">
                <span className="font-medium text-sm">
                  {(job.ocupacion_cupo || 0) * (job.cantidad_millares || 0)}
                </span>
              </TableCell>
              <TableCell className="py-1">
                <JobStatusSelect job={job} onStatusChange={onJobUpdate} />
              </TableCell>
              <TableCell className="text-center py-1">
                {(() => {
                  const paymentStatus = calculatePaymentStatus(job);
                  switch (paymentStatus.paymentStatus) {
                    case "paid":
                      return (
                        <div className="flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      );
                    case "partial":
                      return (
                        <div className="flex items-center justify-center">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        </div>
                      );
                    case "pending":
                      return (
                        <div className="flex items-center justify-center">
                          <XCircle className="h-4 w-4 text-red-600" />
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
              </TableCell>
              <TableCell className="py-1">
                <div className="flex items-center justify-center gap-1">
                  <WhatsAppButton
                    jobId={job.id}
                    clientWhatsapp={job.client?.whatsapp || ""}
                    onMessageCopied={() => {
                      // Recargar la tabla si es necesario
                      console.log("Mensaje copiado para trabajo:", job.id);
                    }}
                  />
                  <MessageHistory
                    jobId={job.id}
                    clientWhatsapp={job.client?.whatsapp || ""}
                  />
                </div>
              </TableCell>
              <TableCell className="py-1">
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewJob(job)}
                    className="h-8 w-8 p-0"
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditJob(job)}
                    className="h-8 w-8 p-0"
                    title="Editar trabajo"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {onAddPayment && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddPayment(job)}
                      disabled={
                        calculatePaymentStatus(job).paymentStatus === "paid"
                      }
                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={
                        calculatePaymentStatus(job).paymentStatus === "paid"
                          ? "Trabajo pagado completamente"
                          : "Agregar pago"
                      }
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteJob(job)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    title="Eliminar trabajo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
