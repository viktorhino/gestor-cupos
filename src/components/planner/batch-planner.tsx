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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Package,
  Calendar,
  Plus,
  CheckCircle,
  ExternalLink,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

// Datos reales desde la base de datos

export function BatchPlanner() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [showOutsourceDialog, setShowOutsourceDialog] = useState(false);
  const [batchData, setBatchData] = useState({
    tipo: "tarjetas",
    fecha: new Date().toISOString().split("T")[0],
    notas: "",
  });
  const [outsourceData, setOutsourceData] = useState({
    proveedor_id: "",
    servicio: "",
    fecha_estimada: "",
    observaciones: "",
  });

  // Hooks para datos reales
  const { jobs: pendingJobs, loading } = useJobsByStatus(
    "pendiente_de_montaje"
  );

  // Procesar trabajos pendientes de montaje
  const pendingItems = {
    tarjetas: pendingJobs.filter((job) => job.tipo === "tarjetas"),
    volantes: pendingJobs.filter((job) => job.tipo === "volantes"),
  };

  // Mock de proveedores (en producción vendría de la API)
  const suppliers = [
    {
      id: "1",
      nombre: "Impresiones Externas S.A.S.",
      servicios: ["impresion", "terminado"],
    },
    {
      id: "2",
      nombre: "Taller Gráfico ABC",
      servicios: ["troquelado", "estampado"],
    },
    {
      id: "3",
      nombre: "Procesos Especiales XYZ",
      servicios: ["perforacion", "despuntadas"],
    },
  ];

  const handleItemSelect = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    }
  };

  const handleSelectAll = (items: any[], checked: boolean) => {
    if (checked) {
      const allIds = items.map((item) => item.id);
      setSelectedItems([...new Set([...selectedItems, ...allIds])]);
    } else {
      const itemIds = items.map((item) => item.id);
      setSelectedItems(selectedItems.filter((id) => !itemIds.includes(id)));
    }
  };

  const canCreateBatch = () => {
    if (selectedItems.length === 0) return false;

    const selectedTarjetas = pendingItems.tarjetas.filter((item) =>
      selectedItems.includes(item.id)
    );
    const selectedVolantes = pendingItems.volantes.filter((item) =>
      selectedItems.includes(item.id)
    );

    // No se pueden mezclar tarjetas y volantes
    if (selectedTarjetas.length > 0 && selectedVolantes.length > 0)
      return false;

    // Para tarjetas, verificar compatibilidad de grupos
    if (selectedTarjetas.length > 0) {
      const grupos = [
        ...new Set(
          selectedTarjetas.map(
            (item) => item.job_items?.[0]?.card_references?.grupo
          )
        ),
      ];
      // Solo brillo, solo mate_reserva, o mixto (brillo + mate_reserva)
      return (
        grupos.length <= 2 &&
        grupos.every((grupo) => ["brillo", "mate_reserva"].includes(grupo))
      );
    }

    return true;
  };

  const getCompatibilityInfo = (items: any[]) => {
    if (items.length === 0) return { compatible: true, message: "" };

    const grupos = [
      ...new Set(
        items.map(
          (item) => item.job_items?.[0]?.card_references?.grupo || "volantes"
        )
      ),
    ];

    if (grupos.length === 1) {
      return { compatible: true, message: `Grupo único: ${grupos[0]}` };
    } else if (
      grupos.length === 2 &&
      grupos.includes("brillo") &&
      grupos.includes("mate_reserva")
    ) {
      return {
        compatible: true,
        message: "Grupo mixto: Brillo + Mate-Reserva",
      };
    } else {
      return { compatible: false, message: "Grupos incompatibles" };
    }
  };

  const createBatch = () => {
    if (!canCreateBatch()) {
      toast.error("No se puede crear el cupo con los items seleccionados");
      return;
    }

    const selectedTarjetas = pendingItems.tarjetas.filter((item) =>
      selectedItems.includes(item.id)
    );
    const selectedVolantes = pendingItems.volantes.filter((item) =>
      selectedItems.includes(item.id)
    );

    const tipo = selectedTarjetas.length > 0 ? "tarjetas" : "volantes";
    const grupos = [
      ...new Set(
        [...selectedTarjetas, ...selectedVolantes].map(
          (item) => item.job_items?.[0]?.card_references?.grupo || "volantes"
        )
      ),
    ];
    const grupo = grupos.length === 1 ? grupos[0] : "mixto";

    toast.success(
      `Cupo de ${tipo} creado con ${selectedItems.length} items (${grupo})`
    );
    setShowBatchDialog(false);
    setSelectedItems([]);
  };

  const outsourceItems = () => {
    if (selectedItems.length === 0) {
      toast.error("Debe seleccionar al menos un item");
      return;
    }

    toast.success(`${selectedItems.length} items enviados a tercerización`);
    setShowOutsourceDialog(false);
    setSelectedItems([]);
  };

  const getPriorityBadge = (prioridad: string) => {
    const priorityMap = {
      alta: { variant: "destructive" as const, label: "Alta" },
      media: { variant: "warning" as const, label: "Media" },
      baja: { variant: "secondary" as const, label: "Baja" },
    };

    return (
      priorityMap[prioridad as keyof typeof priorityMap] || {
        variant: "secondary" as const,
        label: prioridad,
      }
    );
  };

  const getGroupBadge = (grupo: string) => {
    const groupMap = {
      brillo: { variant: "default" as const, label: "Brillo" },
      mate_reserva: { variant: "secondary" as const, label: "Mate-Reserva" },
    };

    return (
      groupMap[grupo as keyof typeof groupMap] || {
        variant: "outline" as const,
        label: grupo,
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Resumen de Selección */}
      {selectedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Items Seleccionados ({selectedItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {selectedItems.length} items seleccionados para montaje
                </p>
                {(() => {
                  const selectedTarjetas = pendingItems.tarjetas.filter(
                    (item) => selectedItems.includes(item.id)
                  );
                  const selectedVolantes = pendingItems.volantes.filter(
                    (item) => selectedItems.includes(item.id)
                  );
                  const compatibilidad = getCompatibilityInfo([
                    ...selectedTarjetas,
                    ...selectedVolantes,
                  ]);

                  return (
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          compatibilidad.compatible ? "success" : "destructive"
                        }
                      >
                        {compatibilidad.compatible
                          ? "Compatible"
                          : "Incompatible"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {compatibilidad.message}
                      </span>
                    </div>
                  );
                })()}
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setShowOutsourceDialog(true)}
                  variant="outline"
                  disabled={!canCreateBatch()}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Tercerizar
                </Button>
                <Button
                  onClick={() => setShowBatchDialog(true)}
                  disabled={!canCreateBatch()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Cupo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs de Items */}
      <Tabs defaultValue="tarjetas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tarjetas" className="flex items-center">
            <Package className="mr-2 h-4 w-4" />
            Tarjetas ({pendingItems.tarjetas.length})
          </TabsTrigger>
          <TabsTrigger value="volantes" className="flex items-center">
            <Package className="mr-2 h-4 w-4" />
            Volantes ({pendingItems.volantes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tarjetas">
          <Card>
            <CardHeader>
              <CardTitle>Tarjetas Pendientes de Montaje</CardTitle>
              <CardDescription>
                Seleccione las tarjetas que desea montar en un cupo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={pendingItems.tarjetas.every((item) =>
                          selectedItems.includes(item.id)
                        )}
                        onCheckedChange={(checked) =>
                          handleSelectAll(
                            pendingItems.tarjetas,
                            checked as boolean
                          )
                        }
                      />
                    </TableHead>
                    <TableHead>Consecutivo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Ocupación</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingItems.tarjetas.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={(checked) =>
                            handleItemSelect(item.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        #{item.consecutivo}
                      </TableCell>
                      <TableCell>{item.clients?.nombre}</TableCell>
                      <TableCell>
                        {item.job_items?.[0]?.card_references?.nombre}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            getGroupBadge(
                              item.job_items?.[0]?.card_references?.grupo
                            ).variant
                          }
                        >
                          {
                            getGroupBadge(
                              item.job_items?.[0]?.card_references?.grupo
                            ).label
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.job_items?.[0]?.ocupacion_cupo}
                      </TableCell>
                      <TableCell>
                        {item.job_items?.[0]?.cantidad_millares?.toLocaleString()}{" "}
                        millares
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getPriorityBadge(item.prioridad).variant}
                        >
                          {getPriorityBadge(item.prioridad).label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(item.fecha_recepcion).toLocaleDateString()}
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
              <CardTitle>Volantes Pendientes de Montaje</CardTitle>
              <CardDescription>
                Seleccione los volantes que desea montar en un cupo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={pendingItems.volantes.every((item) =>
                          selectedItems.includes(item.id)
                        )}
                        onCheckedChange={(checked) =>
                          handleSelectAll(
                            pendingItems.volantes,
                            checked as boolean
                          )
                        }
                      />
                    </TableHead>
                    <TableHead>Consecutivo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Ocupación</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingItems.volantes.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={(checked) =>
                            handleItemSelect(item.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        #{item.consecutivo}
                      </TableCell>
                      <TableCell>{item.clients?.nombre}</TableCell>
                      <TableCell>
                        {item.job_items?.[0]?.flyer_types?.tamaño} -{" "}
                        {item.job_items?.[0]?.flyer_types?.modo}
                      </TableCell>
                      <TableCell>
                        {item.job_items?.[0]?.ocupacion_cupo}
                      </TableCell>
                      <TableCell>
                        {item.job_items?.[0]?.cantidad_millares?.toLocaleString()}{" "}
                        millares
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getPriorityBadge(item.prioridad).variant}
                        >
                          {getPriorityBadge(item.prioridad).label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(item.fecha_recepcion).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Crear Cupo */}
      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Cupo</DialogTitle>
            <DialogDescription>
              Configure los detalles del cupo de producción
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha del Cupo</Label>
              <Input
                id="fecha"
                type="date"
                value={batchData.fecha}
                onChange={(e) =>
                  setBatchData({ ...batchData, fecha: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas">Notas del Cupo</Label>
              <Textarea
                id="notas"
                placeholder="Notas adicionales para el cupo..."
                value={batchData.notas}
                onChange={(e) =>
                  setBatchData({ ...batchData, notas: e.target.value })
                }
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Items Incluidos:</h4>
              <div className="space-y-1">
                {selectedItems.map((itemId) => {
                  const item = [
                    ...pendingItems.tarjetas,
                    ...pendingItems.volantes,
                  ].find((i) => i.id === itemId);
                  return item ? (
                    <div key={itemId} className="text-sm">
                      #{item.consecutivo} - {item.clients?.nombre} -{" "}
                      {item.job_items?.[0]?.card_references?.nombre ||
                        `${item.job_items?.[0]?.flyer_types?.tamaño} - ${item.job_items?.[0]?.flyer_types?.modo}`}
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowBatchDialog(false)}
              >
                Cancelar
              </Button>
              <Button onClick={createBatch}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Crear Cupo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Tercerización */}
      <Dialog open={showOutsourceDialog} onOpenChange={setShowOutsourceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tercerizar Items</DialogTitle>
            <DialogDescription>
              Envíe los items seleccionados a un proveedor externo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proveedor">Proveedor</Label>
              <Select
                value={outsourceData.proveedor_id}
                onValueChange={(value) =>
                  setOutsourceData({ ...outsourceData, proveedor_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="servicio">Servicio</Label>
              <Select
                value={outsourceData.servicio}
                onValueChange={(value) =>
                  setOutsourceData({ ...outsourceData, servicio: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar servicio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="impresion">Impresión</SelectItem>
                  <SelectItem value="terminado">Terminado</SelectItem>
                  <SelectItem value="troquelado">Troquelado</SelectItem>
                  <SelectItem value="estampado">Estampado</SelectItem>
                  <SelectItem value="perforacion">Perforación</SelectItem>
                  <SelectItem value="despuntadas">Despuntadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_estimada">Fecha Estimada de Entrega</Label>
              <Input
                id="fecha_estimada"
                type="date"
                value={outsourceData.fecha_estimada}
                onChange={(e) =>
                  setOutsourceData({
                    ...outsourceData,
                    fecha_estimada: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                placeholder="Observaciones para el proveedor..."
                value={outsourceData.observaciones}
                onChange={(e) =>
                  setOutsourceData({
                    ...outsourceData,
                    observaciones: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowOutsourceDialog(false)}
              >
                Cancelar
              </Button>
              <Button onClick={outsourceItems}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Enviar a Tercerización
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
