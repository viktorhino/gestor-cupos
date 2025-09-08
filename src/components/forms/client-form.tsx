"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Client,
  CreateClientInput,
  UpdateClientInput,
} from "@/lib/types/client";
import { Camera, Upload } from "lucide-react";

interface ClientFormProps {
  client?: Client;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateClientInput | UpdateClientInput) => Promise<void>;
  loading?: boolean;
}

export function ClientForm({
  client,
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: ClientFormProps) {
  const [formData, setFormData] = useState({
    empresa: client?.empresa || "",
    encargado: client?.encargado || "",
    tratamiento: client?.tratamiento || "",
    whatsapp: client?.whatsapp || "",
    email: client?.email || "",
    foto: client?.foto || "",
    nit: client?.nit || "",
    direccion: client?.direccion || "",
    notas: client?.notas || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.empresa.trim()) {
      newErrors.empresa = "El nombre de la empresa es obligatorio";
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = "El WhatsApp es obligatorio";
    } else if (!/^\d{10}$/.test(formData.whatsapp.replace(/\s/g, ""))) {
      newErrors.whatsapp = "Ingrese un número de WhatsApp válido (10 dígitos)";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ingrese un email válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const submitData = client
      ? ({ ...formData, id: client.id } as UpdateClientInput)
      : (formData as CreateClientInput);

    await onSubmit(submitData);
    onClose();

    // Reset form if creating new client
    if (!client) {
      setFormData({
        nombre: "",
        encargado: "",
        whatsapp: "",
        email: "",
        foto: "",
        nit: "",
        direccion: "",
        notas: "",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers;
    }
    return numbers.slice(0, 10);
  };

  const getInitials = (empresa: string, encargado?: string) => {
    const firstInitial = empresa?.charAt(0) || "";
    const lastInitial = encargado?.charAt(0) || "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {client ? "Editar Cliente" : "Nuevo Cliente"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Foto del cliente */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={formData.foto} />
                <AvatarFallback className="text-lg">
                  {formData.empresa ? (
                    getInitials(formData.empresa, formData.encargado)
                  ) : (
                    <Camera className="w-8 h-8" />
                  )}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                onClick={() => {
                  // TODO(stagewise): Implementar subida de imágenes
                  console.log("Función de subida de imagen pendiente");
                }}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Nombre de la Empresa */}
          <div className="space-y-2">
            <Label htmlFor="empresa">Nombre de la Empresa *</Label>
            <Input
              id="empresa"
              value={formData.empresa}
              onChange={(e) => handleInputChange("empresa", e.target.value)}
              className={errors.empresa ? "border-red-500" : ""}
              placeholder="Ej: Empresa ABC"
            />
            {errors.empresa && (
              <p className="text-sm text-red-500">{errors.empresa}</p>
            )}
          </div>

          {/* Encargado */}
          <div className="space-y-2">
            <Label htmlFor="encargado">Encargado (opcional)</Label>
            <Input
              id="encargado"
              value={formData.encargado}
              onChange={(e) => handleInputChange("encargado", e.target.value)}
              placeholder="Ej: Juan Pérez"
            />
          </div>

          {/* Tratamiento */}
          <div className="space-y-2">
            <Label htmlFor="tratamiento">Tratamiento (opcional)</Label>
            <Input
              id="tratamiento"
              value={formData.tratamiento}
              onChange={(e) => handleInputChange("tratamiento", e.target.value)}
              placeholder="Ej: Don Juan, Juan, Sr. Pérez"
            />
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp *</Label>
            <Input
              id="whatsapp"
              value={formData.whatsapp}
              onChange={(e) =>
                handleInputChange("whatsapp", formatWhatsApp(e.target.value))
              }
              className={errors.whatsapp ? "border-red-500" : ""}
              placeholder="3001234567"
              maxLength={10}
            />
            {errors.whatsapp && (
              <p className="text-sm text-red-500">{errors.whatsapp}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""}
              placeholder="cliente@email.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* NIT */}
          <div className="space-y-2">
            <Label htmlFor="nit">NIT</Label>
            <Input
              id="nit"
              value={formData.nit}
              onChange={(e) => handleInputChange("nit", e.target.value)}
              placeholder="12345678-9"
            />
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => handleInputChange("direccion", e.target.value)}
              placeholder="Dirección del cliente"
            />
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => handleInputChange("notas", e.target.value)}
              placeholder="Notas adicionales sobre el cliente"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : client ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
