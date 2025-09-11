"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { JobReceptionForm } from "@/components/forms/job-reception-form";

export default function ReceptionPage() {
  return (
    <MainLayout
      title="Recepción de Trabajos"
      subtitle="Registrar nuevos trabajos de tarjetas y volantes"
    >
      <div className="max-w-4xl mx-auto">
        <JobReceptionForm />
      </div>
    </MainLayout>
  );
}






