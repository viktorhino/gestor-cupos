"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { SPECIAL_FINISHES } from "@/lib/supabase/config";

interface SpecialFinish {
  id: string;
  name: string;
  pricePerThousand: number;
  unit: "per_thousand" | "per_event";
  metadata: {
    type?: "circular" | "linear";
    position?: "center" | "side";
    vertical?: "top" | "bottom";
    sides?: number;
    color?: "gold" | "silver" | "copper";
    style?: string;
  };
  isActive: boolean;
}

export function SpecialFinishes() {
  const [finishes, setFinishes] = useState<SpecialFinish[]>([
    {
      id: "1",
      name: "perforacion",
      pricePerThousand: 2000,
      unit: "per_thousand",
      metadata: {
        type: "circular",
        position: "center",
      },
      isActive: true,
    },
    {
      id: "2",
      name: "despuntadas",
      pricePerThousand: 1500,
      unit: "per_thousand",
      metadata: {
        sides: 2,
      },
      isActive: true,
    },
    {
      id: "3",
      name: "estampado",
      pricePerThousand: 3000,
      unit: "per_thousand",
      metadata: {
        color: "gold",
        style: "relieve",
      },
      isActive: true,
    },
    {
      id: "4",
      name: "repujado",
      pricePerThousand: 2500,
      unit: "per_thousand",
      metadata: {},
      isActive: true,
    },
    {
      id: "5",
      name: "troquelado",
      pricePerThousand: 4000,
      unit: "per_event",
      metadata: {},
      isActive: true,
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFinish, setEditingFinish] = useState<SpecialFinish | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    pricePerThousand: 0,
    unit: "per_thousand" as "per_thousand" | "per_event",
    metadata: {} as SpecialFinish["metadata"],
  });

  const handleEdit = (finish: SpecialFinish) => {
    setEditingFinish(finish);
    setFormData({
      name: finish.name,
      pricePerThousand: finish.pricePerThousand,
      unit: finish.unit,
      metadata: finish.metadata,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingFinish) {
      setFinishes(
        finishes.map((f) =>
          f.id === editingFinish.id ? { ...f, ...formData } : f
        )
      );
    } else {
      const newFinish: SpecialFinish = {
        id: Date.now().toString(),
        ...formData,
        isActive: true,
      };
      setFinishes([...finishes, newFinish]);
    }
    setIsDialogOpen(false);
    setEditingFinish(null);
    setFormData({
      name: "",
      pricePerThousand: 0,
      unit: "per_thousand",
      metadata: {},
    });
  };

  const handleDelete = (id: string) => {
    setFinishes(finishes.filter((f) => f.id !== id));
  };

  const getFinishDisplayName = (name: string) => {
    return name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getUnitDisplayName = (unit: string) => {
    return unit === "per_thousand" ? "Por Millar" : "Por Evento";
  };

  const renderMetadataInfo = (metadata: SpecialFinish["metadata"]) => {
    const info = [];
    if (metadata.type) info.push(`Tipo: ${metadata.type}`);
    if (metadata.position) info.push(`Posición: ${metadata.position}`);
    if (metadata.vertical) info.push(`Vertical: ${metadata.vertical}`);
    if (metadata.sides) info.push(`Lados: ${metadata.sides}`);
    if (metadata.color) info.push(`Color: ${metadata.color}`);
    if (metadata.style) info.push(`Estilo: ${metadata.style}`);
    return info.join(", ");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Terminaciones Especiales</h2>
          <p className="text-muted-foreground">
            Gestiona los precios y parámetros de las terminaciones especiales
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingFinish(null);
                setFormData({
                  name: "",
                  pricePerThousand: 0,
                  unit: "per_thousand",
                  metadata: {},
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Terminación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingFinish ? "Editar Terminación" : "Nueva Terminación"}
              </DialogTitle>
              <DialogDescription>
                {editingFinish
                  ? "Modifica la terminación especial"
                  : "Agrega una nueva terminación especial"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Select
                  value={formData.name}
                  onValueChange={(value) =>
                    setFormData({ ...formData, name: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una terminación" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIAL_FINISHES.map((finish) => (
                      <SelectItem key={finish} value={finish}>
                        {getFinishDisplayName(finish)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pricePerThousand">Precio</Label>
                  <Input
                    id="pricePerThousand"
                    type="number"
                    value={formData.pricePerThousand}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricePerThousand: Number(e.target.value),
                      })
                    }
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unidad</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value: "per_thousand" | "per_event") =>
                      setFormData({ ...formData, unit: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per_thousand">Por Millar</SelectItem>
                      <SelectItem value="per_event">Por Evento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Parámetros Específicos</Label>
                <div className="grid grid-cols-2 gap-4">
                  {formData.name === "perforacion" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="type">Tipo</Label>
                        <Select
                          value={formData.metadata.type || ""}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              metadata: {
                                ...formData.metadata,
                                type: value as "circular" | "linear",
                              },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="circular">Circular</SelectItem>
                            <SelectItem value="linear">Lineal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Posición</Label>
                        <Select
                          value={formData.metadata.position || ""}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              metadata: {
                                ...formData.metadata,
                                position: value as "center" | "side",
                              },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona posición" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="center">Centro</SelectItem>
                            <SelectItem value="side">Lado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {formData.name === "despuntadas" && (
                    <div className="space-y-2">
                      <Label htmlFor="sides">Número de Lados</Label>
                      <Input
                        id="sides"
                        type="number"
                        min="1"
                        max="4"
                        value={formData.metadata.sides || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            metadata: {
                              ...formData.metadata,
                              sides: Number(e.target.value),
                            },
                          })
                        }
                        placeholder="2"
                      />
                    </div>
                  )}

                  {formData.name === "estampado" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="color">Color</Label>
                        <Select
                          value={formData.metadata.color || ""}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              metadata: {
                                ...formData.metadata,
                                color: value as "gold" | "silver" | "copper",
                              },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona color" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gold">Dorado</SelectItem>
                            <SelectItem value="silver">Plata</SelectItem>
                            <SelectItem value="copper">Cobre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="style">Estilo</Label>
                        <Input
                          id="style"
                          value={formData.metadata.style || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              metadata: {
                                ...formData.metadata,
                                style: e.target.value,
                              },
                            })
                          }
                          placeholder="relieve, plano, etc."
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Terminaciones Especiales</CardTitle>
          <CardDescription>
            Precios y parámetros de las terminaciones especiales disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="h-6 bg-gray-100">
                <TableHead className="py-1 text-xs font-semibold">
                  Nombre
                </TableHead>
                <TableHead className="py-1 text-xs font-semibold">
                  Precio
                </TableHead>
                <TableHead className="py-1 text-xs font-semibold">
                  Unidad
                </TableHead>
                <TableHead className="py-1 text-xs font-semibold">
                  Parámetros
                </TableHead>
                <TableHead className="py-1 text-xs font-semibold">
                  Estado
                </TableHead>
                <TableHead className="text-right py-1 text-xs font-semibold">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finishes.map((finish) => (
                <TableRow key={finish.id} className="h-6">
                  <TableCell className="font-medium py-1 text-sm">
                    {getFinishDisplayName(finish.name)}
                  </TableCell>
                  <TableCell className="py-1 text-sm">
                    ${finish.pricePerThousand.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-1 text-sm">
                    {getUnitDisplayName(finish.unit)}
                  </TableCell>
                  <TableCell className="py-1">
                    <span className="text-xs text-muted-foreground">
                      {renderMetadataInfo(finish.metadata) || "Sin parámetros"}
                    </span>
                  </TableCell>
                  <TableCell className="py-1">
                    <Badge
                      variant={finish.isActive ? "success" : "destructive"}
                      className="text-xs"
                    >
                      {finish.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-1">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(finish)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(finish.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
