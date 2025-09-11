"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { storageService } from "@/lib/services/storage";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface PaymentImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  paymentId?: string;
  disabled?: boolean;
}

export function PaymentImageUpload({
  value,
  onChange,
  paymentId,
  disabled = false,
}: PaymentImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido");
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen debe ser menor a 5MB");
      return;
    }

    try {
      setIsUploading(true);

      // Crear preview temporal
      const base64 = await storageService.fileToBase64(file);
      setPreview(base64);

      // Si tenemos un paymentId, subir inmediatamente
      if (paymentId) {
        const imageUrl = await storageService.uploadPaymentImage(
          file,
          paymentId
        );
        if (imageUrl) {
          onChange(imageUrl);
          toast.success("Imagen subida exitosamente");
        } else {
          toast.error("Error al subir la imagen");
          setPreview(null);
        }
      } else {
        // Si no tenemos paymentId, solo mostrar preview
        toast.info("Imagen seleccionada. Se subirá al guardar el pago.");
      }
    } catch (error) {
      toast.error("Error al procesar la imagen");
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    if (disabled) return;

    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((item) => item.type.startsWith("image/"));

    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) {
        await handleFileSelect(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = async () => {
    if (value) {
      // Eliminar imagen del storage
      await storageService.deletePaymentImage(value);
    }
    setPreview(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${
            disabled
              ? "border-gray-200 bg-gray-50 cursor-not-allowed"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }
          ${preview ? "border-green-300 bg-green-50" : ""}
        `}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onPaste={handlePaste}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {preview ? (
          <div className="space-y-2">
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Preview"
                className="max-h-32 max-w-full rounded-lg object-cover"
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <p className="text-sm text-green-600 font-medium">
              Imagen de soporte de pago
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {isUploading ? (
              <div className="space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-blue-600">Subiendo imagen...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Imagen de soporte de pago
                  </p>
                  <p className="text-xs text-gray-500">
                    Arrastra imagen o pega (Ctrl+V)
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {preview && !isUploading && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Imagen seleccionada</span>
          <div className="flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            <span>Comprobante de pago</span>
          </div>
        </div>
      )}
    </div>
  );
}
