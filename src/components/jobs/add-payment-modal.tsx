"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobWithDetails } from "@/lib/types/database";
import { jobService } from "@/lib/services/jobs";
import { storageService } from "@/lib/services/storage";
import { PaymentImageUpload } from "@/components/ui/payment-image-upload";
import { toast } from "sonner";
import { CreditCard, DollarSign } from "lucide-react";

interface AddPaymentModalProps {
  job: JobWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentAdded?: () => void;
}

export function AddPaymentModal({
  job,
  isOpen,
  onClose,
  onPaymentAdded,
}: AddPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState({
    monto: 0,
    metodo: "efectivo" as const,
    observacion: "",
    imagen_url: "",
  });
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);

  // Resetear formulario cuando se abre/cierra
  React.useEffect(() => {
    if (isOpen) {
      setPayment({
        monto: 0,
        metodo: "efectivo",
        observacion: "",
        imagen_url: "",
      });
      setTempImageFile(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!job || payment.monto <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }

    try {
      setLoading(true);

      // Si hay una imagen temporal, subirla primero
      let imageUrl = payment.imagen_url;
      if (tempImageFile) {
        // Generar un ID temporal para el pago
        const tempPaymentId = `temp-${Date.now()}`;
        imageUrl = await storageService.uploadPaymentImage(
          tempImageFile,
          tempPaymentId
        );
        if (!imageUrl) {
          toast.error("Error al subir la imagen de soporte");
          return;
        }
      }

      // Crear el pago con la imagen
      await jobService.createPayment(job.id, {
        ...payment,
        imagen_url: imageUrl,
      });

      toast.success("Pago agregado exitosamente");
      onPaymentAdded?.();
      onClose();
    } catch (error) {
      toast.error("Error al agregar el pago");
    } finally {
      setLoading(false);
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

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Agregar Pago
          </DialogTitle>
          <DialogDescription>
            Registre un nuevo pago para este trabajo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información del trabajo */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm">{job.nombre_trabajo}</h4>
            <p className="text-xs text-muted-foreground">
              Cliente: {job.client?.empresa}
            </p>
            <p className="text-xs text-muted-foreground">ID: {job.id}</p>
          </div>

          {/* Monto */}
          <div className="space-y-2">
            <Label htmlFor="monto" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Monto *
            </Label>
            <Input
              id="monto"
              type="number"
              min="0"
              step="0.01"
              value={payment.monto}
              onChange={(e) =>
                setPayment({
                  ...payment,
                  monto: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="0.00"
              required
            />
          </div>

          {/* Método de pago */}
          <div className="space-y-2">
            <Label htmlFor="metodo">Método de Pago *</Label>
            <Select
              value={payment.metodo}
              onValueChange={(value: any) =>
                setPayment({ ...payment, metodo: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">
                  <span className="flex items-center gap-2">
                    <span>💵</span>
                    Efectivo
                  </span>
                </SelectItem>
                <SelectItem value="transferencia">
                  <span className="flex items-center gap-2">
                    <span>🏦</span>
                    Transferencia
                  </span>
                </SelectItem>
                <SelectItem value="cheque">
                  <span className="flex items-center gap-2">
                    <span>📄</span>
                    Cheque
                  </span>
                </SelectItem>
                <SelectItem value="tarjeta">
                  <span className="flex items-center gap-2">
                    <span>💳</span>
                    Tarjeta
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observación */}
          <div className="space-y-2">
            <Label htmlFor="observacion">Observación</Label>
            <Textarea
              id="observacion"
              value={payment.observacion}
              onChange={(e) =>
                setPayment({ ...payment, observacion: e.target.value })
              }
              placeholder="Observaciones adicionales..."
              rows={3}
            />
          </div>

          {/* Imagen de soporte */}
          <div className="space-y-2">
            <Label>Imagen de Soporte de Pago</Label>
            <PaymentImageUpload
              value={payment.imagen_url}
              onChange={(imageUrl) => {
                setPayment({ ...payment, imagen_url: imageUrl });
                setTempImageFile(null);
              }}
              paymentId={job.id}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Sube una imagen del comprobante de pago (transferencia, cheque,
              etc.)
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Agregando..." : "Agregar Pago"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
