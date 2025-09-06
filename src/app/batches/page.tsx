"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { BatchHistory } from "@/components/batch/batch-history";

export default function BatchesPage() {
  return (
    <MainLayout
      title="Cupos del Día"
      subtitle="Historial y gestión de cupos de producción"
    >
      <BatchHistory />
    </MainLayout>
  );
}



