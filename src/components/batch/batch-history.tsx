"use client";

import { useState, useEffect } from "react";
import { useJobs } from "@/lib/hooks/use-jobs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Package,
  Calculator,
  Eye,
  Edit,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

// Datos reales desde la base de datos

export function BatchHistory() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [showCostingDialog, setShowCostingDialog] = useState(false);
  const [costingData, setCostingData] = useState({
    papel: 0,
    planchas: 0,
    impresion: 0,
    terminacion_basica: 0,
    terminacion_especial: 0,
    refilado: 0,
    otros: 0,
    notas: "",
  });

  // Hooks para datos reales
  const { jobs, loading } = useJobs();

  // Procesar trabajos para simular cupos (en producción vendría de la API de cupos)
  const batches = jobs
    .filter(
      (job) =>
        job.estado === "en_cupo" ||
        job.estado === "impreso" ||
        job.estado === "terminado"
    )
    .map((job) => ({
      id: job.id,
      tipo: job.tipo,
      fecha:
        job.fecha_recepcion?.split("T")[0] ||
        new Date().toISOString().split("T")[0],
      grupo: job.job_items?.[0]?.card_references?.grupo || "volantes",
      estado: job.estado === "en_cupo" ? "en_produccion" : "cerrado",
      total_piezas:
        job.job_items?.reduce(
          (sum, item) => sum + (item.ocupacion_cupo || 0),
          0
        ) || 0,
      items:
        job.job_items?.map((item) => ({
          id: item.id,
          consecutivo: job.consecutivo,
          cliente: job.clients?.nombre,
          referencia:
            item.card_references?.nombre ||
            `${item.flyer_types?.tamaño} - ${item.flyer_types?.modo}`,
          cantidad: item.cantidad_millares,
          ocupacion: item.ocupacion_cupo,
        })) || [],
      costeo: null, // En producción vendría de la tabla costing
    }));

  const filteredBatches = batches.filter(
    (batch) => batch.fecha === selectedDate
  );

  const getStatusBadge = (estado: string) => {
    const statusMap = {
      planificado: { variant: "secondary" as const, label: "Planificado" },
      en_produccion: { variant: "warning" as const, label: "En Producción" },
      cerrado: { variant: "success" as const, label: "Cerrado" },
    };

    return (
      statusMap[estado as keyof typeof statusMap] || {
        variant: "secondary" as const,
        label: estado,
      }
    );
  };

  const getTypeBadge = (tipo: string) => {
    const typeMap = {
      tarjetas: { variant: "default" as const, label: "Tarjetas" },
      volantes: { variant: "secondary" as const, label: "Volantes" },
    };

    return (
      typeMap[tipo as keyof typeof typeMap] || {
        variant: "outline" as const,
        label: tipo,
      }
    );
  };

  const viewBatchDetails = (batch: any) => {
    setSelectedBatch(batch);
    setShowBatchDialog(true);
  };

  const editCosting = (batch: any) => {
    setSelectedBatch(batch);
    if (batch.costeo) {
      setCostingData({
        papel: batch.costeo.papel,
        planchas: batch.costeo.planchas,
        impresion: batch.costeo.impresion,
        terminacion_basica: batch.costeo.terminacion_basica,
        terminacion_especial: batch.costeo.terminacion_especial,
        refilado: batch.costeo.refilado,
        otros: batch.costeo.otros,
        notas: "",
      });
    } else {
      setCostingData({
        papel: 0,
        planchas: 0,
        impresion: 0,
        terminacion_basica: 0,
        terminacion_especial: 0,
        refilado: 0,
        otros: 0,
        notas: "",
      });
    }
    setShowCostingDialog(true);
  };

  const saveCosting = () => {
    const total =
      costingData.papel +
      costingData.planchas +
      costingData.impresion +
      costingData.terminacion_basica +
      costingData.terminacion_especial +
      costingData.refilado +
      costingData.otros;

    toast.success(`Costeo guardado. Total: $${total.toLocaleString()}`);
    setShowCostingDialog(false);
    setSelectedBatch(null);
  };

  const calculateMargin = (batch: any) => {
    if (!batch.costeo) return null;

    // Calcular ingresos estimados (esto vendría de los precios de venta)
    const estimatedRevenue = batch.items.reduce((total: number, item: any) => {
      // Precio estimado por millar (esto debería venir de la base de datos)
      const pricePerThousand = item.referencia ? 15000 : 10000; // Tarjetas vs Volantes
      return total + pricePerThousand * item.cantidad;
    }, 0);

    const margin = estimatedRevenue - batch.costeo.total_costo;
    const marginPercentage = (margin / estimatedRevenue) * 100;

    return { revenue: estimatedRevenue, margin, percentage: marginPercentage };
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen del Día */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cupos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredBatches.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredBatches.filter((b) => b.tipo === "tarjetas").length}{" "}
              tarjetas,{" "}
              {filteredBatches.filter((b) => b.tipo === "volantes").length}{" "}
              volantes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Piezas</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredBatches.reduce(
                (total, batch) => total + batch.total_piezas,
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Piezas procesadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {filteredBatches
                .filter((b) => b.costeo)
                .reduce((total, batch) => total + batch.costeo.total_costo, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Costos registrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Cupos */}
      <Card>
        <CardHeader>
          <CardTitle>Cupos del {selectedDate}</CardTitle>
          <CardDescription>
            {filteredBatches.length} cupos encontrados para esta fecha
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBatches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay cupos registrados para esta fecha
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Piezas</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Costo</TableHead>
                  <TableHead>Margen</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.map((batch) => {
                  const margin = calculateMargin(batch);
                  return (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">#{batch.id}</TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadge(batch.tipo).variant}>
                          {getTypeBadge(batch.tipo).label}
                        </Badge>
                      </TableCell>
                      <TableCell>{batch.grupo}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(batch.estado).variant}>
                          {getStatusBadge(batch.estado).label}
                        </Badge>
                      </TableCell>
                      <TableCell>{batch.total_piezas}</TableCell>
                      <TableCell>{batch.items.length}</TableCell>
                      <TableCell>
                        {batch.costeo ? (
                          <span className="font-medium">
                            ${batch.costeo.total_costo.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            Sin costear
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {margin ? (
                          <div className="text-sm">
                            <div
                              className={`font-medium ${
                                margin.margin >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              ${margin.margin.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {margin.percentage.toFixed(1)}%
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewBatchDetails(batch)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editCosting(batch)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalles del Cupo */}
      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Cupo #{selectedBatch?.id}</DialogTitle>
            <DialogDescription>
              Detalles del cupo de {selectedBatch?.tipo} del{" "}
              {selectedBatch?.fecha}
            </DialogDescription>
          </DialogHeader>
          {selectedBatch && (
            <div className="space-y-6">
              {/* Información General */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium">Tipo</Label>
                  <p>
                    {selectedBatch.tipo === "tarjetas"
                      ? "Tarjetas"
                      : "Volantes"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Grupo</Label>
                  <p>{selectedBatch.grupo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estado</Label>
                  <Badge variant={getStatusBadge(selectedBatch.estado).variant}>
                    {getStatusBadge(selectedBatch.estado).label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Piezas</Label>
                  <p>{selectedBatch.total_piezas}</p>
                </div>
              </div>

              {/* Items del Cupo */}
              <div>
                <Label className="text-sm font-medium">Items Incluidos</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Consecutivo</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Referencia/Tipo</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Ocupación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedBatch.items.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          #{item.consecutivo}
                        </TableCell>
                        <TableCell>{item.cliente}</TableCell>
                        <TableCell>{item.referencia || item.tipo}</TableCell>
                        <TableCell>{item.cantidad.toLocaleString()}</TableCell>
                        <TableCell>{item.ocupacion}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Costeo */}
              {selectedBatch.costeo && (
                <div>
                  <Label className="text-sm font-medium">
                    Desglose de Costos
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Papel
                      </Label>
                      <p className="font-medium">
                        ${selectedBatch.costeo.papel.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Planchas
                      </Label>
                      <p className="font-medium">
                        ${selectedBatch.costeo.planchas.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Impresión
                      </Label>
                      <p className="font-medium">
                        ${selectedBatch.costeo.impresion.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Terminación Básica
                      </Label>
                      <p className="font-medium">
                        $
                        {selectedBatch.costeo.terminacion_basica.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Terminación Especial
                      </Label>
                      <p className="font-medium">
                        $
                        {selectedBatch.costeo.terminacion_especial.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Refilado
                      </Label>
                      <p className="font-medium">
                        ${selectedBatch.costeo.refilado.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Otros
                      </Label>
                      <p className="font-medium">
                        ${selectedBatch.costeo.otros.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Total
                      </Label>
                      <p className="font-bold text-lg">
                        ${selectedBatch.costeo.total_costo.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Costeo */}
      <Dialog open={showCostingDialog} onOpenChange={setShowCostingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Costeo del Cupo #{selectedBatch?.id}</DialogTitle>
            <DialogDescription>
              Registre los costos de producción para este cupo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="papel">Papel</Label>
                <Input
                  id="papel"
                  type="number"
                  value={costingData.papel}
                  onChange={(e) =>
                    setCostingData({
                      ...costingData,
                      papel: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="planchas">Planchas</Label>
                <Input
                  id="planchas"
                  type="number"
                  value={costingData.planchas}
                  onChange={(e) =>
                    setCostingData({
                      ...costingData,
                      planchas: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="impresion">Impresión</Label>
                <Input
                  id="impresion"
                  type="number"
                  value={costingData.impresion}
                  onChange={(e) =>
                    setCostingData({
                      ...costingData,
                      impresion: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terminacion_basica">Terminación Básica</Label>
                <Input
                  id="terminacion_basica"
                  type="number"
                  value={costingData.terminacion_basica}
                  onChange={(e) =>
                    setCostingData({
                      ...costingData,
                      terminacion_basica: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terminacion_especial">
                  Terminación Especial
                </Label>
                <Input
                  id="terminacion_especial"
                  type="number"
                  value={costingData.terminacion_especial}
                  onChange={(e) =>
                    setCostingData({
                      ...costingData,
                      terminacion_especial: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="refilado">Refilado</Label>
                <Input
                  id="refilado"
                  type="number"
                  value={costingData.refilado}
                  onChange={(e) =>
                    setCostingData({
                      ...costingData,
                      refilado: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otros">Otros</Label>
                <Input
                  id="otros"
                  type="number"
                  value={costingData.otros}
                  onChange={(e) =>
                    setCostingData({
                      ...costingData,
                      otros: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                placeholder="Notas adicionales sobre el costeo..."
                value={costingData.notas}
                onChange={(e) =>
                  setCostingData({ ...costingData, notas: e.target.value })
                }
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total del Costo:</span>
                <span className="text-xl font-bold">
                  $
                  {(
                    costingData.papel +
                    costingData.planchas +
                    costingData.impresion +
                    costingData.terminacion_basica +
                    costingData.terminacion_especial +
                    costingData.refilado +
                    costingData.otros
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCostingDialog(false)}
              >
                Cancelar
              </Button>
              <Button onClick={saveCosting}>
                <Calculator className="mr-2 h-4 w-4" />
                Guardar Costeo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
