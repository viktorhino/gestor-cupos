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
import { CardGroup, CARD_GROUPS, CARD_REFERENCES } from "@/lib/supabase/config";

interface CardPrice {
  id: string;
  reference: string;
  group: CardGroup;
  pricePerThousand: number;
  priceListId: string;
  isActive: boolean;
}

export function CardPrices() {
  const [prices, setPrices] = useState<CardPrice[]>([
    {
      id: "1",
      reference: "brillo_uv",
      group: "brillo",
      pricePerThousand: 15000,
      priceListId: "current",
      isActive: true,
    },
    {
      id: "2",
      reference: "mate_2l",
      group: "mate_reserva",
      pricePerThousand: 12000,
      priceListId: "current",
      isActive: true,
    },
    {
      id: "3",
      reference: "reserva_1l",
      group: "mate_reserva",
      pricePerThousand: 10000,
      priceListId: "current",
      isActive: true,
    },
    {
      id: "4",
      reference: "reserva_2l",
      group: "mate_reserva",
      pricePerThousand: 11000,
      priceListId: "current",
      isActive: true,
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<CardPrice | null>(null);
  const [formData, setFormData] = useState({
    reference: "",
    group: "brillo" as CardGroup,
    pricePerThousand: 0,
  });

  const handleEdit = (price: CardPrice) => {
    setEditingPrice(price);
    setFormData({
      reference: price.reference,
      group: price.group,
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
      const newPrice: CardPrice = {
        id: Date.now().toString(),
        ...formData,
        priceListId: "current",
        isActive: true,
      };
      setPrices([...prices, newPrice]);
    }
    setIsDialogOpen(false);
    setEditingPrice(null);
    setFormData({ reference: "", group: "brillo", pricePerThousand: 0 });
  };

  const handleDelete = (id: string) => {
    setPrices(prices.filter((p) => p.id !== id));
  };

  const getGroupBadgeVariant = (group: CardGroup) => {
    switch (group) {
      case "brillo":
        return "default";
      case "mate_reserva":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            Precios de Referencias de Tarjetas
          </h2>
          <p className="text-muted-foreground">
            Gestiona los precios base por millar para cada tipo de tarjeta
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingPrice(null);
                setFormData({
                  reference: "",
                  group: "brillo",
                  pricePerThousand: 0,
                });
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
                  ? "Modifica el precio de la referencia"
                  : "Agrega una nueva referencia de tarjeta"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reference">Referencia</Label>
                <Select
                  value={formData.reference}
                  onValueChange={(value) =>
                    setFormData({ ...formData, reference: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una referencia" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARD_REFERENCES.map((ref) => (
                      <SelectItem key={ref} value={ref}>
                        {ref.replace(/_/g, " ").toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="group">Grupo</Label>
                <Select
                  value={formData.group}
                  onValueChange={(value: CardGroup) =>
                    setFormData({ ...formData, group: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARD_GROUPS.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group.replace(/_/g, " ").toUpperCase()}
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
          <CardTitle>Lista de Precios Actual</CardTitle>
          <CardDescription>
            Precios base por millar para referencias de tarjetas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="h-6 bg-gray-100">
                <TableHead className="py-1 text-xs font-semibold">
                  Referencia
                </TableHead>
                <TableHead className="py-1 text-xs font-semibold">
                  Grupo
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
                    {price.reference.replace(/_/g, " ").toUpperCase()}
                  </TableCell>
                  <TableCell className="py-1">
                    <Badge
                      variant={getGroupBadgeVariant(price.group)}
                      className="text-xs"
                    >
                      {price.group.replace(/_/g, " ").toUpperCase()}
                    </Badge>
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
