import { MainLayout } from "@/components/layout/main-layout";
import { PrinterConfig } from "@/components/printing/printer-config";

export default function PrintingPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Sistema de Impresión
          </h1>
          <p className="text-muted-foreground">
            Configura y gestiona la impresión térmica de órdenes y comprobantes
          </p>
        </div>

        <PrinterConfig />
      </div>
    </MainLayout>
  );
}



