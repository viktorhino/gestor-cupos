"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { BatchPlanner } from "@/components/planner/batch-planner";

export default function PlannerPage() {
  return (
    <MainLayout
      title="Planificador de Cupos"
      subtitle="Montar trabajos en cupos de producción"
    >
      <BatchPlanner />
    </MainLayout>
  );
}



