import { qz } from "qz-tray";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export interface PrintJob {
  id: string;
  type: "production_order" | "delivery_receipt";
  data: {
    clientName: string;
    consecutive: string;
    date: string;
    items: Array<{
      reference: string;
      quantity: number;
      specialFinishes?: string[];
      observations?: string;
    }>;
    total: number;
    downPayment?: number;
    balance?: number;
    notes?: string;
  };
}

export class ThermalPrinterService {
  private isConnected = false;

  async connect(): Promise<boolean> {
    try {
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
      }
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error("Error connecting to QZ Tray:", error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (qz.websocket.isActive()) {
        await qz.websocket.disconnect();
      }
      this.isConnected = false;
    } catch (error) {
      console.error("Error disconnecting from QZ Tray:", error);
    }
  }

  async printProductionOrder(job: PrintJob): Promise<boolean> {
    try {
      if (!this.isConnected) {
        const connected = await this.connect();
        if (!connected) {
          throw new Error("No se pudo conectar a la impresora");
        }
      }

      const config = [
        {
          type: "raw",
          format: "image",
          data: await this.generateProductionOrderImage(job),
        },
      ];

      await qz.print(config);
      return true;
    } catch (error) {
      console.error("Error printing production order:", error);
      return false;
    }
  }

  async printDeliveryReceipt(job: PrintJob): Promise<boolean> {
    try {
      if (!this.isConnected) {
        const connected = await this.connect();
        if (!connected) {
          throw new Error("No se pudo conectar a la impresora");
        }
      }

      const config = [
        {
          type: "raw",
          format: "image",
          data: await this.generateDeliveryReceiptImage(job),
        },
      ];

      await qz.print(config);
      return true;
    } catch (error) {
      console.error("Error printing delivery receipt:", error);
      return false;
    }
  }

  private async generateProductionOrderImage(job: PrintJob): Promise<string> {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo crear el contexto del canvas");

    // Configuración del canvas para impresora térmica (80mm)
    canvas.width = 576; // 80mm a 72 DPI
    canvas.height = 800; // Altura dinámica

    // Fondo blanco
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Configuración de fuente
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";

    let y = 20;

    // Título
    ctx.font = "bold 16px Arial";
    ctx.fillText("ORDEN DE PRODUCCIÓN", canvas.width / 2, y);
    y += 30;

    // Línea separadora
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(canvas.width - 20, y);
    ctx.stroke();
    y += 20;

    // Información del cliente
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Cliente: ${job.data.clientName}`, 20, y);
    y += 20;

    ctx.fillText(`Consecutivo: ${job.data.consecutive}`, 20, y);
    y += 20;

    ctx.fillText(`Fecha: ${job.data.date}`, 20, y);
    y += 30;

    // Línea separadora
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(canvas.width - 20, y);
    ctx.stroke();
    y += 20;

    // Items
    ctx.font = "bold 12px Arial";
    ctx.fillText("DETALLE DEL TRABAJO", 20, y);
    y += 25;

    ctx.font = "10px Arial";
    job.data.items.forEach((item, index) => {
      ctx.fillText(`${index + 1}. ${item.reference}`, 20, y);
      y += 15;
      ctx.fillText(
        `   Cantidad: ${item.quantity.toLocaleString()} unidades`,
        20,
        y
      );
      y += 15;

      if (item.specialFinishes && item.specialFinishes.length > 0) {
        ctx.fillText(
          `   Terminaciones: ${item.specialFinishes.join(", ")}`,
          20,
          y
        );
        y += 15;
      }

      if (item.observations) {
        ctx.fillText(`   Observaciones: ${item.observations}`, 20, y);
        y += 15;
      }
      y += 10;
    });

    // Línea separadora
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(canvas.width - 20, y);
    ctx.stroke();
    y += 20;

    // Totales
    ctx.font = "bold 12px Arial";
    ctx.fillText(`Total: $${job.data.total.toLocaleString()}`, 20, y);
    y += 20;

    if (job.data.downPayment) {
      ctx.fillText(`Abono: $${job.data.downPayment.toLocaleString()}`, 20, y);
      y += 20;
      ctx.fillText(
        `Saldo: $${(job.data.total - job.data.downPayment).toLocaleString()}`,
        20,
        y
      );
      y += 20;
    }

    if (job.data.notes) {
      y += 10;
      ctx.font = "10px Arial";
      ctx.fillText("NOTAS:", 20, y);
      y += 15;
      ctx.fillText(job.data.notes, 20, y);
    }

    // Pie de página
    y += 30;
    ctx.font = "8px Arial";
    ctx.textAlign = "center";
    ctx.fillText("T&V Impresiones - Sistema de Gestión", canvas.width / 2, y);
    y += 15;
    ctx.fillText(
      "Impreso el: " + new Date().toLocaleString(),
      canvas.width / 2,
      y
    );

    return canvas.toDataURL("image/png");
  }

  private async generateDeliveryReceiptImage(job: PrintJob): Promise<string> {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo crear el contexto del canvas");

    // Configuración del canvas para impresora térmica (80mm)
    canvas.width = 576; // 80mm a 72 DPI
    canvas.height = 600; // Altura dinámica

    // Fondo blanco
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Configuración de fuente
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";

    let y = 20;

    // Título
    ctx.font = "bold 16px Arial";
    ctx.fillText("COMPROBANTE DE ENTREGA", canvas.width / 2, y);
    y += 30;

    // Línea separadora
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(canvas.width - 20, y);
    ctx.stroke();
    y += 20;

    // Información del cliente
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Cliente: ${job.data.clientName}`, 20, y);
    y += 20;

    ctx.fillText(`Consecutivo: ${job.data.consecutive}`, 20, y);
    y += 20;

    ctx.fillText(`Fecha de entrega: ${job.data.date}`, 20, y);
    y += 30;

    // Línea separadora
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(canvas.width - 20, y);
    ctx.stroke();
    y += 20;

    // Items entregados
    ctx.font = "bold 12px Arial";
    ctx.fillText("ITEMS ENTREGADOS", 20, y);
    y += 25;

    ctx.font = "10px Arial";
    job.data.items.forEach((item, index) => {
      ctx.fillText(`${index + 1}. ${item.reference}`, 20, y);
      y += 15;
      ctx.fillText(
        `   Cantidad: ${item.quantity.toLocaleString()} unidades`,
        20,
        y
      );
      y += 20;
    });

    // Línea separadora
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(canvas.width - 20, y);
    ctx.stroke();
    y += 20;

    // Saldo
    if (job.data.balance !== undefined) {
      ctx.font = "bold 12px Arial";
      ctx.fillText(
        `Saldo pendiente: $${job.data.balance.toLocaleString()}`,
        20,
        y
      );
      y += 30;
    }

    // Pie de página
    y += 20;
    ctx.font = "8px Arial";
    ctx.textAlign = "center";
    ctx.fillText("T&V Impresiones - Sistema de Gestión", canvas.width / 2, y);
    y += 15;
    ctx.fillText(
      "Entregado el: " + new Date().toLocaleString(),
      canvas.width / 2,
      y
    );

    return canvas.toDataURL("image/png");
  }

  async printPDF(htmlContent: string, filename: string): Promise<void> {
    try {
      const canvas = await html2canvas(document.body, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  }
}

export const thermalPrinter = new ThermalPrinterService();






