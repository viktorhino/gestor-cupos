"use client";

// Forzar renderizado dinámico para evitar problemas con variables de entorno
export const dynamic = "force-dynamic";

import { MainLayout } from "@/components/layout/main-layout";
import { JobSearch } from "@/components/jobs/job-search";
import { JobList } from "@/components/jobs/job-list";
import { JobFormModal } from "@/components/jobs/job-form-modal";
import { JobDetailsModal } from "@/components/jobs/job-details-modal";
import { DeleteJobDialog } from "@/components/jobs/delete-job-dialog";
import { AddPaymentModal } from "@/components/jobs/add-payment-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { JobWithDetails } from "@/lib/types/database";
import { jobService } from "@/lib/services/jobs";
import { toast } from "sonner";

export default function TrabajosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddJob, setShowAddJob] = useState(false);
  const [editingJob, setEditingJob] = useState<JobWithDetails | null>(null);
  const [viewingJob, setViewingJob] = useState<JobWithDetails | null>(null);
  const [deletingJob, setDeletingJob] = useState<JobWithDetails | null>(null);
  const [addingPaymentJob, setAddingPaymentJob] =
    useState<JobWithDetails | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDeleteJob = async (job: JobWithDetails) => {
    try {
      const success = await jobService.deleteJob(job.id);
      if (success) {
        toast.success("Trabajo eliminado exitosamente");
        setRefreshKey((prev) => prev + 1);
      } else {
        toast.error("Error al eliminar el trabajo");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Error al eliminar el trabajo");
    }
  };

  return (
    <MainLayout title="Gestión de Trabajos">
      <div className="space-y-6">
        {/* Header con botón flotante */}
        <div className="flex justify-end">
          <Button
            onClick={() => setShowAddJob(true)}
            className="fixed top-20 right-6 z-10"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Trabajo
          </Button>
        </div>

        {/* Buscador más estrecho */}
        <div className="max-w-md">
          <JobSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div>

        {/* Lista de trabajos */}
        <JobList
          key={refreshKey}
          searchTerm={searchTerm}
          onEditJob={(job) => {
            setEditingJob(job);
            setShowAddJob(true);
          }}
          onDeleteJob={(job) => {
            setDeletingJob(job);
          }}
          onViewJob={(job) => {
            setViewingJob(job);
          }}
          onAddPayment={(job) => {
            setAddingPaymentJob(job);
          }}
          onJobUpdate={(job) => {
            // Refrescar la lista cuando se actualice un trabajo
            setRefreshKey((prev) => prev + 1);
          }}
        />

        {/* Modal para agregar/editar trabajo */}
        <JobFormModal
          isOpen={showAddJob}
          onClose={() => {
            setShowAddJob(false);
            setEditingJob(null);
          }}
          job={editingJob}
          onJobSaved={(job) => {
            setRefreshKey((prev) => prev + 1);
            setShowAddJob(false);
            setEditingJob(null);
          }}
        />

        {/* Modal para ver detalles del trabajo */}
        <JobDetailsModal
          job={viewingJob}
          isOpen={!!viewingJob}
          onClose={() => setViewingJob(null)}
          onEdit={(job) => {
            setViewingJob(null);
            setEditingJob(job);
            setShowAddJob(true);
          }}
          onDelete={(job) => {
            setViewingJob(null);
            setDeletingJob(job);
          }}
        />

        {/* Diálogo de confirmación para eliminar trabajo */}
        <DeleteJobDialog
          job={deletingJob}
          isOpen={!!deletingJob}
          onClose={() => setDeletingJob(null)}
          onConfirm={handleDeleteJob}
        />

        {/* Modal para agregar pago */}
        <AddPaymentModal
          job={addingPaymentJob}
          isOpen={!!addingPaymentJob}
          onClose={() => setAddingPaymentJob(null)}
          onPaymentAdded={() => {
            setRefreshKey((prev) => prev + 1);
          }}
        />
      </div>
    </MainLayout>
  );
}
