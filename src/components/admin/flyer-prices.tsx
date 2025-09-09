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
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { FLYER_SIZES, FLYER_MODES } from "@/lib/supabase/config";

interface FlyerPrice {
  id: string;
  size: string;
  mode: string;
  pricePerThousand: number;
  priceListId: string;
  isActive: boolean;
}

export function FlyerPrices() {
  const [prices, setPrices] = useState<FlyerPrice[]>([
    {
      id: "1",
      size: "media_carta",
      mode: "4x0",
      pricePerThousand: 8000,
      priceListId: "current",
      isActive: true,
    },
    {
      id: "2",
      size: "media_carta",
      mode: "4x1",
      pricePerThousand: 10000,
      priceListId: "current",
      isActive: true,
    },
    {
      id: "3",
      size: "media_carta",
      mode: "4x4",
      pricePerThousand: 12000,
      priceListId: "current",
      isActive: true,
    },
    {
      id: "4",
      size: "cuarto_carta",
      mode: "4x0",
      pricePerThousand: 5000,
      priceListId: "current",
      isActive: true,
    },
    {
      id: "5",
      size: "cuarto_carta",
      mode: "4x1",
      pricePerThousand: 6000,
      priceListId: "current",
      isActive: true,
    },
    {
      id: "6",
      size: "cuarto_carta",
      mode: "4x4",
      pricePerThousand: 7000,
      priceListId: "current",
      isActive: true,
    },
    {
      id: "7",
      size: "mini_volante",
      mode: "4x0",
      pricePerThousand: 3000,
      priceListId: "current",
      isActive: true,
    },
    {
      id: "8",
      size: "mini_volante",
      mode: "4x1",
      pricePerThousand: 3500,
      priceListId: "current",
      isActive: true,
    },
    {
      id: "9",
      size: "mini_volante",
      mode: "4x4",
      pricePerThousand: 4000,
      priceListId: "current",
      isActive: true,
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<FlyerPrice | null>(null);
  const [formData, setFormData] = useState({
    size: "",
    mode: "",
    pricePerThousand: 0,
  });

  const handleEdit = (price: FlyerPrice) => {
    setEditingPrice(price);
    setFormData({
      size: price.size,
      mode: price.mode,
      pricePerThousand: price.pricePerThousand,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingPrice) {
      setPrices(
        prices.map((p) =>
          p.id === editingPrice.id ? { ...p, ...formData } : p
        )
      );
    } else {
      const newPrice: FlyerPrice = {
        id: Date.now().toString(),
        ...formData,
        priceListId: "current",
        isActive: true,
      };
      setPrices([...prices, newPrice]);
    }
    setIsDialogOpen(false);
    setEditingPrice(null);
    setFormData({ size: "", mode: "", pricePerThousand: 0 });
  };

  const handleDelete = (id: string) => {
    setPrices(prices.filter((p) => p.id !== id));
  };

  const getSizeDisplayName = (size: string) => {
    return size.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getModeDisplayName = (mode: string) => {
    return mode.replace("x", " × ");
  };

  const getModeDescription = (mode: string) => {
    switch (mode) {
      case "4x0":
        return "Full color por 1 lado";
      case "4x1":
        return "Full color por 1 lado + 1 tinta por el otro";
      case "4x4":
        return "Full color por ambos lados";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Precios de Volantes</h2>
          <p className="text-muted-foreground">
            Gestiona los precios por tamaño y modo de impresión de volantes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingPrice(null);
                setFormData({ size: "", mode: "", pricePerThousand: 0 });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Precio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPrice ? "Editar Precio" : "Nuevo Precio"}
              </DialogTitle>
              <DialogDescription>
                {editingPrice
                  ? "Modifica el precio del volante"
                  : "Agrega un nuevo precio de volante"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="size">Tamaño</Label>
                <Select
                  value={formData.size}
                  onValueChange={(value) =>
                    setFormData({ ...formData, size: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tamaño" />
                  </SelectTrigger>
                  <SelectContent>
                    {FLYER_SIZES.map((size) => (
                      <SelectItem key={size} value={size}>
                        {getSizeDisplayName(size)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mode">Modo de Impresión</Label>
                <Select
                  value={formData.mode}
                  onValueChange={(value) =>
                    setFormData({ ...formData, mode: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un modo" />
                  </SelectTrigger>
                  <SelectContent>
                    {FLYER_MODES.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        <div className="flex flex-col">
                          <span>{getModeDisplayName(mode)}</span>
                          <span className="text-xs text-muted-foreground">
                            {getModeDescription(mode)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerThousand">Precio por Millar</Label>
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
          <CardTitle>Lista de Precios de Volantes</CardTitle>
          <CardDescription>
            Precios por tamaño y modo de impresión
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="h-6 bg-gray-100">
                <TableHead className="py-1 text-xs font-semibold">
                  Tamaño
                </TableHead>
                <TableHead className="py-1 text-xs font-semibold">
                  Modo
                </TableHead>
                <TableHead className="py-1 text-xs font-semibold">
                  Descripción
                </TableHead>
                <TableHead className="py-1 text-xs font-semibold">
                  Precio por Millar
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
              {prices.map((price) => (
                <TableRow key={price.id} className="h-6">
                  <TableCell className="font-medium py-1 text-sm">
                    {getSizeDisplayName(price.size)}
                  </TableCell>
                  <TableCell className="py-1">
                    <Badge variant="outline" className="text-xs">
                      {getModeDisplayName(price.mode)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1">
                    <span className="text-xs text-muted-foreground">
                      {getModeDescription(price.mode)}
                    </span>
                  </TableCell>
                  <TableCell className="py-1 text-sm">
                    ${price.pricePerThousand.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-1">
                    <Badge
                      variant={price.isActive ? "success" : "destructive"}
                      className="text-xs"
                    >
                      {price.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-1">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(price)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(price.id)}
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
