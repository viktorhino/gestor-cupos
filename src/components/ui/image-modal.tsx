"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Image as ImageIcon } from "lucide-react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  title?: string;
}

export function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  title = "Imagen del Trabajo",
}: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Visualice la imagen en tamaño completo
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {imageUrl ? (
            <div className="flex justify-center">
              <img
                src={imageUrl}
                alt={title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No hay imagen disponible
              </h3>
              <p className="text-sm text-muted-foreground">
                Este trabajo no tiene una imagen asociada
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
