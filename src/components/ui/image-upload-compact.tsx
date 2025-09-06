"use client";

import React, { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { storageService } from "@/lib/services/storage";

interface ImageUploadCompactProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  jobId?: string;
}

export function ImageUploadCompact({
  value,
  onChange,
  disabled,
  className,
  jobId,
}: ImageUploadCompactProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona un archivo de imagen válido");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es demasiado grande. Máximo 5MB");
        return;
      }

      setIsLoading(true);

      try {
        // Crear preview temporal
        const base64 = await storageService.fileToBase64(file);
        setPreviewUrl(base64);

        // Si tenemos jobId, subir a Supabase Storage
        if (jobId) {
          const imageUrl = await storageService.uploadWorkImage(file, jobId);
          if (imageUrl) {
            onChange(imageUrl);
          } else {
            alert("Error al subir la imagen. Inténtalo de nuevo.");
            setPreviewUrl("");
          }
        } else {
          // Si no hay jobId, usar base64 temporal
          onChange(base64);
        }
      } catch (error) {
        console.error("Error processing file:", error);
        alert("Error al procesar la imagen");
        setPreviewUrl("");
      } finally {
        setIsLoading(false);
      }
    },
    [onChange, jobId]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [disabled, handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (disabled) return;

      const items = Array.from(e.clipboardData.items);
      const imageItem = items.find((item) => item.type.startsWith("image/"));

      if (imageItem) {
        const file = imageItem.getAsFile();
        if (file) {
          handleFile(file);
        }
      }
    },
    [disabled, handleFile]
  );

  const handleRemove = useCallback(async () => {
    if (value && value.startsWith("http")) {
      await storageService.deleteWorkImage(value);
    }

    onChange("");
    setPreviewUrl("");
  }, [onChange, value]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Área de carga compacta */}
      <div
        className={cn(
          "relative border border-dashed rounded-md p-3 text-center transition-colors cursor-pointer",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "opacity-50 cursor-not-allowed",
          value && "border-green-500 bg-green-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-xs text-muted-foreground">Cargando...</span>
          </div>
        ) : value || previewUrl ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <ImageIcon className="h-3 w-3 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-700">
              Imagen cargada
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 rounded-full hover:bg-red-100"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              disabled={disabled}
            >
              <X className="h-3 w-3 text-red-500" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
              <Upload className="h-3 w-3 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">
              Arrastra imagen o pega (Ctrl+V)
            </span>
          </div>
        )}
      </div>

      {/* Miniatura compacta */}
      {(value || previewUrl) && (
        <div className="flex justify-center">
          <img
            src={value || previewUrl}
            alt="Vista previa"
            className="w-16 h-16 object-cover rounded-md border"
          />
        </div>
      )}
    </div>
  );
}


