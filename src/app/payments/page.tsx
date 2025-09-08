import { MainLayout } from "@/components/layout/main-layout";
import { PaymentsManagement } from "@/components/jobs/payments-management";

export default function PaymentsPage() {
  return (
    <MainLayout
      title="Gestión de Pagos"
      subtitle="Administrar pagos de trabajos"
    >
      <PaymentsManagement />
    </MainLayout>
  );
}
