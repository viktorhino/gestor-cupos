"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { JobReceptionForm } from "@/components/forms/job-reception-form";
import { JobWithDetails } from "@/lib/types/database";

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: JobWithDetails | null;
  onJobSaved?: (job: JobWithDetails) => void;
}

export function JobFormModal({
  isOpen,
  onClose,
  job,
  onJobSaved,
}: JobFormModalProps) {
  const handleJobSaved = (savedJob: JobWithDetails) => {
    onJobSaved?.(savedJob);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {job ? "Editar Trabajo" : "Agregar Nuevo Trabajo"}
          </DialogTitle>
          <DialogDescription>
            {job
              ? "Modifica los detalles del trabajo existente"
              : "Complete la información para crear un nuevo trabajo de producción"}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <JobReceptionForm
            initialData={job}
            onJobSaved={handleJobSaved}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
