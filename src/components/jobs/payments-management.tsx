"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  User,
  Image as ImageIcon,
  Eye,
} from "lucide-react";
import { jobService } from "@/lib/services/jobs";
import { JobWithDetails, Payment } from "@/lib/types/database";
import { toast } from "sonner";

interface JobWithPayments extends JobWithDetails {
  payments: Payment[];
  totalPaid: number;
  remainingBalance: number;
  paymentStatus: "pending" | "partial" | "paid";
}

export function PaymentsManagement() {
  const [jobs, setJobs] = useState<JobWithPayments[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobWithPayments[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "partial" | "paid"
  >("all");
  const [selectedJob, setSelectedJob] = useState<JobWithPayments | null>(null);
  const [addPaymentDialog, setAddPaymentDialog] = useState(false);
  const [newPayment, setNewPayment] = useState({
    monto: 0,
    metodo: "efectivo" as const,
    observacion: "",
  });
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  // Cargar trabajos con pagos
  const loadJobs = async () => {
    try {
      setLoading(true);
      const allJobs = await jobService.getJobs();

      const jobsWithPayments = await Promise.all(
        allJobs.map(async (job) => {
          const payments = await jobService.getJobPayments(job.id);
          const totalPaid = payments.reduce(
            (sum, payment) => sum + payment.monto,
            0
          );
          const jobValue = calculateJobValue(job);
          const remainingBalance = jobValue - totalPaid;

          let paymentStatus: "pending" | "partial" | "paid" = "pending";
          if (totalPaid >= jobValue) {
            paymentStatus = "paid";
          } else if (totalPaid > 0) {
            paymentStatus = "partial";
          }

          return {
            ...job,
            payments,
            totalPaid,
            remainingBalance,
            paymentStatus,
          };
        })
      );

      setJobs(jobsWithPayments);
      setFilteredJobs(jobsWithPayments);
    } catch (error) {
      console.error("Error loading jobs:", error);
      toast.error("Error al cargar los trabajos");
    } finally {
      setLoading(false);
    }
  };

  // Calcular valor del trabajo (simplificado)
  const calculateJobValue = (job: JobWithDetails): number => {
    // Función simple para calcular el valor del trabajo
    return (job as any).valor_estimado || 0;
  };

  // Filtrar trabajos
  useEffect(() => {
    let filtered = jobs;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          (job.nombre_trabajo || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          job.client?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado de pago
    if (statusFilter !== "all") {
      filtered = filtered.filter((job) => job.paymentStatus === statusFilter);
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, statusFilter]);

  // Agregar nuevo pago
  const handleAddPayment = async () => {
    if (!selectedJob || newPayment.monto <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }

    try {
      await jobService.createPayment(selectedJob.id, newPayment);
      toast.success("Pago agregado exitosamente");
      setAddPaymentDialog(false);
      setNewPayment({ monto: 0, metodo: "efectivo", observacion: "" });
      await loadJobs(); // Recargar datos
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error("Error al agregar el pago");
    }
  };

  // Marcar trabajo como pagado completamente
  const handleMarkAsPaid = async (job: JobWithPayments) => {
    if (job.remainingBalance <= 0) {
      toast.error("Este trabajo ya está pagado completamente");
      return;
    }

    try {
      await jobService.createPayment(job.id, {
        monto: job.remainingBalance,
        metodo: "efectivo",
        observacion: "Pago completo del trabajo",
      });
      toast.success("Trabajo marcado como pagado");
      await loadJobs(); // Recargar datos
    } catch (error) {
      console.error("Error marking as paid:", error);
      toast.error("Error al marcar como pagado");
    }
  };

  const handleShowImage = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setImageModalOpen(true);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Pagado</Badge>;
      case "partial":
        return <Badge className="bg-yellow-100 text-yellow-800">Parcial</Badge>;
      case "pending":
        return <Badge className="bg-red-100 text-red-800">Pendiente</Badge>;
      default:
        return <Badge>Desconocido</Badge>;
    }
  };

  const getPaymentMethodIcon = (metodo: string) => {
    switch (metodo) {
      case "efectivo":
        return "💵";
      case "transferencia":
        return "🏦";
      case "cheque":
        return "📄";
      case "tarjeta":
        return "💳";
      default:
        return "💰";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Cargando trabajos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Pagos</h1>
          <p className="text-muted-foreground">
            Administra los pagos y abonos de los trabajos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium">
            {filteredJobs.length} trabajos
          </span>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por trabajo o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select
                value={statusFilter}
                onValueChange={(value: any) => setStatusFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="partial">Parciales</SelectItem>
                  <SelectItem value="paid">Pagados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de trabajos */}
      <Card>
        <CardHeader>
          <CardTitle>Trabajos y Pagos</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredJobs.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No se encontraron trabajos
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {job.nombre_trabajo || "Sin nombre"}
                          </h3>
                          {getStatusBadge(job.paymentStatus)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{job.client?.nombre}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(job.created_at).toLocaleDateString(
                                "es-ES"
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>
                              Valor: ${calculateJobValue(job).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ${job.totalPaid.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Pagado de ${calculateJobValue(job).toLocaleString()}
                        </div>
                        {job.remainingBalance > 0 && (
                          <div className="text-sm text-red-600 font-medium">
                            Saldo: ${job.remainingBalance.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pagos existentes */}
                    {job.payments.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-2">Pagos realizados:</h4>
                        <div className="space-y-2">
                          {job.payments.map((payment, index) => (
                            <div
                              key={payment.id || index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <div className="flex items-center gap-2">
                                <span>
                                  {getPaymentMethodIcon(payment.metodo)}
                                </span>
                                <span className="text-sm">
                                  {payment.metodo.charAt(0).toUpperCase() +
                                    payment.metodo.slice(1)}
                                </span>
                                {payment.observacion && (
                                  <span className="text-xs text-muted-foreground">
                                    - {payment.observacion}
                                  </span>
                                )}
                                {payment.imagen_url && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleShowImage(payment.imagen_url!)
                                    }
                                    className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                                    title="Ver comprobante"
                                  >
                                    <ImageIcon className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-medium">
                                  ${payment.monto.toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(payment.fecha).toLocaleDateString(
                                    "es-ES"
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        disabled={job.paymentStatus === "paid"}
                        onClick={() => {
                          setSelectedJob(job);
                          setAddPaymentDialog(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {job.paymentStatus === "paid"
                          ? "Pagado"
                          : "Agregar Pago"}
                      </Button>
                      {job.remainingBalance > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsPaid(job)}
                        >
                          Marcar como Pagado
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para agregar pago */}
      <Dialog open={addPaymentDialog} onOpenChange={setAddPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Pago</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedJob && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium">
                  {selectedJob.nombre_trabajo || "Sin nombre"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Cliente: {selectedJob.client?.nombre}
                </p>
                <p className="text-sm text-muted-foreground">
                  Saldo pendiente: $
                  {selectedJob.remainingBalance.toLocaleString()}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="monto">Monto *</Label>
              <Input
                id="monto"
                type="number"
                min="0"
                step="0.01"
                value={newPayment.monto}
                onChange={(e) =>
                  setNewPayment({
                    ...newPayment,
                    monto: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metodo">Método de Pago *</Label>
              <Select
                value={newPayment.metodo}
                onValueChange={(value: any) =>
                  setNewPayment({ ...newPayment, metodo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacion">Observación</Label>
              <Textarea
                id="observacion"
                value={newPayment.observacion}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, observacion: e.target.value })
                }
                placeholder="Observaciones adicionales..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setAddPaymentDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddPayment}>Agregar Pago</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para mostrar imagen de comprobante */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              Comprobante de Pago
            </DialogTitle>
          </DialogHeader>
          {selectedImageUrl && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={selectedImageUrl}
                  alt="Comprobante de pago"
                  className="max-h-96 max-w-full rounded-lg object-contain"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setImageModalOpen(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
