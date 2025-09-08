"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { BatchHistory } from "@/components/batch/batch-history";

// Forzar renderizado dinámico para evitar problemas con variables de entorno
export const dynamic = "force-dynamic";

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
