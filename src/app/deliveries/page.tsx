"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { DeliveryInterface } from "@/components/delivery/delivery-interface";

export default function DeliveriesPage() {
  return (
    <MainLayout
      title="Entregas"
      subtitle="Gestionar entregas de trabajos terminados"
    >
      <DeliveryInterface />
    </MainLayout>
  );
}



