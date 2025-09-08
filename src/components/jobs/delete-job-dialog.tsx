"use client";

import { JobWithDetails } from "@/lib/types/database";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteJobDialogProps {
  job: JobWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (job: JobWithDetails) => void;
}

export function DeleteJobDialog({
  job,
  isOpen,
  onClose,
  onConfirm,
}: DeleteJobDialogProps) {
  if (!job) return null;

  const handleConfirm = () => {
    onConfirm(job);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Confirmar Eliminación
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <div>¿Estás seguro de que quieres eliminar este trabajo?</div>
            <div className="bg-muted p-3 rounded-md">
              <div className="font-medium">
                {job.nombre_trabajo || "Sin nombre"}
              </div>
              <div className="text-sm text-muted-foreground">
                Cliente: {job.client?.empresa || "Sin cliente"}
              </div>
              <div className="text-sm text-muted-foreground">
                Trabajo #{job.consecutivo}
              </div>
            </div>
            <div className="text-sm text-destructive font-medium">
              Esta acción no se puede deshacer.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar Trabajo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
