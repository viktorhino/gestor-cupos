"use client";

import { useState, useEffect } from "react";
import { useJobsByStatus } from "@/lib/hooks/use-jobs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Package,
  Truck,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

// Datos reales desde la base de datos

export function DeliveryInterface() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentData, setPaymentData] = useState({
    monto: 0,
    metodo: "efectivo",
    observacion: "",
  });

  // Hooks para datos reales
  const { jobs: readyJobs, loading: readyLoading } =
    useJobsByStatus("listo_para_entrega");
  const { jobs: pendingJobs, loading: pendingLoading } = useJobsByStatus(
    "pendiente_de_montaje"
  );

  // Procesar trabajos listos para entrega
  const pendingDeliveries = {
    tarjetas: readyJobs.filter((job) => job.tipo === "tarjetas"),
    volantes: readyJobs.filter((job) => job.tipo === "volantes"),
  };

  const pendingMount = pendingJobs;

  const filteredTarjetas = pendingDeliveries.tarjetas.filter(
    (job) =>
      job.clients?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.consecutivo.toString().includes(searchTerm) ||
      job.job_items?.[0]?.card_references?.nombre
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const filteredVolantes = pendingDeliveries.volantes.filter(
    (job) =>
      job.clients?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.consecutivo.toString().includes(searchTerm) ||
      job.job_items?.[0]?.flyer_types?.tamaño
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const handleDelivery = (job: any) => {
    setSelectedJob(job);
    setShowDeliveryDialog(true);
  };

  const handlePayment = (job: any) => {
    setSelectedJob(job);
    setPaymentData({
      monto: job.saldo || 0,
      metodo: "efectivo",
      observacion: "",
    });
    setShowPaymentDialog(true);
  };

  const confirmDelivery = () => {
    toast.success(`Trabajo #${selectedJob.consecutivo} entregado exitosamente`);
    setShowDeliveryDialog(false);
    setSelectedJob(null);
  };

  const confirmPayment = () => {
    toast.success(`Pago de $${paymentData.monto.toLocaleString()} registrado`);
    setShowPaymentDialog(false);
    setSelectedJob(null);
  };

  const getStatusBadge = (estado: string) => {
    const statusMap = {
      listo_para_entrega: {
        variant: "success" as const,
        label: "Listo Entrega",
      },
      pendiente_de_montaje: {
        variant: "warning" as const,
        label: "Pendiente Montaje",
      },
      entregado: { variant: "default" as const, label: "Entregado" },
    };

    return (
      statusMap[estado as keyof typeof statusMap] || {
        variant: "secondary" as const,
        label: estado,
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-5 w-5" />
            Búsqueda de Trabajos
          </CardTitle>
          <CardDescription>
            Busque por cliente, consecutivo o referencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Input
              placeholder="Buscar trabajos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Trabajos */}
      <Tabs defaultValue="tarjetas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tarjetas" className="flex items-center">
            <Package className="mr-2 h-4 w-4" />
            Tarjetas ({filteredTarjetas.length})
          </TabsTrigger>
          <TabsTrigger value="volantes" className="flex items-center">
            <Truck className="mr-2 h-4 w-4" />
            Volantes ({filteredVolantes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tarjetas">
          <Card>
            <CardHeader>
              <CardTitle>Tarjetas Listas para Entrega</CardTitle>
              <CardDescription>
                Trabajos de tarjetas pendientes de entrega
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Consecutivo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTarjetas.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        #{job.consecutivo}
                      </TableCell>
                      <TableCell>{job.clients?.nombre}</TableCell>
                      <TableCell>
                        {job.job_items?.[0]?.card_references?.nombre}
                      </TableCell>
                      <TableCell>
                        {job.job_items?.[0]?.cantidad_millares?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ${job.total_estimado?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            job.saldo > 0
                              ? "text-orange-600 font-semibold"
                              : "text-green-600"
                          }
                        >
                          ${job.saldo.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(job.estado).variant}>
                          {getStatusBadge(job.estado).label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => handleDelivery(job)}>
                            <Truck className="mr-1 h-3 w-3" />
                            Entregar
                          </Button>
                          {job.saldo > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePayment(job)}
                            >
                              <CreditCard className="mr-1 h-3 w-3" />
                              Pagar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volantes">
          <Card>
            <CardHeader>
              <CardTitle>Volantes Listos para Entrega</CardTitle>
              <CardDescription>
                Trabajos de volantes pendientes de entrega
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Consecutivo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVolantes.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        #{job.consecutivo}
                      </TableCell>
                      <TableCell>{job.clients?.nombre}</TableCell>
                      <TableCell>
                        {job.job_items?.[0]?.flyer_types?.tamaño} -{" "}
                        {job.job_items?.[0]?.flyer_types?.modo}
                      </TableCell>
                      <TableCell>
                        {job.job_items?.[0]?.cantidad_millares?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ${job.total_estimado?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            job.saldo > 0
                              ? "text-orange-600 font-semibold"
                              : "text-green-600"
                          }
                        >
                          ${job.saldo.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(job.estado).variant}>
                          {getStatusBadge(job.estado).label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => handleDelivery(job)}>
                            <Truck className="mr-1 h-3 w-3" />
                            Entregar
                          </Button>
                          {job.saldo > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePayment(job)}
                            >
                              <CreditCard className="mr-1 h-3 w-3" />
                              Pagar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pendientes por Montar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Pendientes por Montar
          </CardTitle>
          <CardDescription>
            Trabajos que requieren ser montados en cupos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pendingMount.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <Badge variant="warning">Pendiente Montaje</Badge>
                  <div>
                    <p className="font-medium">
                      #{job.consecutivo} - {job.clients?.nombre}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {job.tipo === "tarjetas"
                        ? job.job_items?.[0]?.card_references?.nombre
                        : `${job.job_items?.[0]?.flyer_types?.tamaño} - ${job.job_items?.[0]?.flyer_types?.modo}`}{" "}
                      •{" "}
                      {job.job_items?.[0]?.cantidad_millares?.toLocaleString()}{" "}
                      unidades
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Recibido: {job.fecha_recepcion}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Entrega */}
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Entrega</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea entregar este trabajo?
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium">Detalles del Trabajo</h4>
                <p>Consecutivo: #{selectedJob.consecutivo}</p>
                <p>Cliente: {selectedJob.cliente}</p>
                <p>Total: ${selectedJob.total.toLocaleString()}</p>
                <p>Saldo: ${selectedJob.saldo.toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entregado_a">Entregado a:</Label>
                <Input id="entregado_a" placeholder="Nombre de quien recibe" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documento">Documento:</Label>
                <Input id="documento" placeholder="Número de documento" />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeliveryDialog(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={confirmDelivery}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar Entrega
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Pago */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>
              Registre un pago para este trabajo
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium">Detalles del Trabajo</h4>
                <p>Consecutivo: #{selectedJob.consecutivo}</p>
                <p>Cliente: {selectedJob.cliente}</p>
                <p>Saldo Pendiente: ${selectedJob.saldo.toLocaleString()}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="monto">Monto del Pago</Label>
                  <Input
                    id="monto"
                    type="number"
                    value={paymentData.monto}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        monto: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metodo">Método de Pago</Label>
                  <Select
                    value={paymentData.metodo}
                    onValueChange={(value) =>
                      setPaymentData({
                        ...paymentData,
                        metodo: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="transferencia">
                        Transferencia
                      </SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacion">Observación</Label>
                  <Textarea
                    id="observacion"
                    placeholder="Observación del pago..."
                    value={paymentData.observacion}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        observacion: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentDialog(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={confirmPayment}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Registrar Pago
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
