"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Filter,
  Calendar,
  TrendingUp,
  DollarSign,
  Package,
} from "lucide-react";

interface SalesData {
  period: string;
  totalJobs: number;
  totalRevenue: number;
  totalCards: number;
  totalFlyers: number;
  averageOrderValue: number;
  topClient: string;
  topReference: string;
}

interface SalesByClient {
  clientName: string;
  totalJobs: number;
  totalRevenue: number;
  lastOrder: string;
  status: "active" | "inactive";
}

interface SalesByReference {
  reference: string;
  type: "card" | "flyer";
  totalQuantity: number;
  totalRevenue: number;
  averagePrice: number;
  orders: number;
}

export function SalesReport() {
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [reportData, setReportData] = useState<SalesData>({
    period: "Enero 2024",
    totalJobs: 45,
    totalRevenue: 1250000,
    totalCards: 120000,
    totalFlyers: 85000,
    averageOrderValue: 27778,
    topClient: "Empresa ABC S.A.S.",
    topReference: "Brillo UV",
  });

  const [salesByClient] = useState<SalesByClient[]>([
    {
      clientName: "Empresa ABC S.A.S.",
      totalJobs: 12,
      totalRevenue: 450000,
      lastOrder: "2024-01-15",
      status: "active",
    },
    {
      clientName: "Comercial XYZ Ltda.",
      totalJobs: 8,
      totalRevenue: 320000,
      lastOrder: "2024-01-10",
      status: "active",
    },
    {
      clientName: "Distribuidora 123",
      totalJobs: 15,
      totalRevenue: 280000,
      lastOrder: "2024-01-08",
      status: "inactive",
    },
    {
      clientName: "Impresiones Plus",
      totalJobs: 6,
      totalRevenue: 150000,
      lastOrder: "2024-01-12",
      status: "active",
    },
  ]);

  const [salesByReference] = useState<SalesByReference[]>([
    {
      reference: "Brillo UV",
      type: "card",
      totalQuantity: 50000,
      totalRevenue: 750000,
      averagePrice: 15,
      orders: 25,
    },
    {
      reference: "Mate 2L",
      type: "card",
      totalQuantity: 35000,
      totalRevenue: 420000,
      averagePrice: 12,
      orders: 18,
    },
    {
      reference: "Media Carta 4x4",
      type: "flyer",
      totalQuantity: 40000,
      totalRevenue: 480000,
      averagePrice: 12,
      orders: 20,
    },
    {
      reference: "Cuarto Carta 4x1",
      type: "flyer",
      totalQuantity: 25000,
      totalRevenue: 150000,
      averagePrice: 6,
      orders: 15,
    },
  ]);

  const handleGenerateReport = () => {
    // Aquí se generaría el reporte con los datos reales
  };

  const handleExportPDF = () => {
    // Aquí se exportaría el reporte a PDF
  };

  const handleExportExcel = () => {
    // Aquí se exportaría el reporte a Excel
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reporte de Ventas</h2>
          <p className="text-muted-foreground">
            Análisis de ventas por período, cliente y referencia
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros del Reporte</CardTitle>
          <CardDescription>
            Selecciona el período y rango de fechas para el reporte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="period">Período</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mes</SelectItem>
                  <SelectItem value="quarter">Este Trimestre</SelectItem>
                  <SelectItem value="year">Este Año</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha Inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha Fin</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
              />
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={handleGenerateReport}>
              <Filter className="h-4 w-4 mr-2" />
              Generar Reporte
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Trabajos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              +12% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${reportData.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+8% vs mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Promedio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${reportData.averageOrderValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+5% vs mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Piezas Producidas
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                reportData.totalCards + reportData.totalFlyers
              ).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {reportData.totalCards.toLocaleString()} tarjetas,{" "}
              {reportData.totalFlyers.toLocaleString()} volantes
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients">Por Cliente</TabsTrigger>
          <TabsTrigger value="references">Por Referencia</TabsTrigger>
        </TabsList>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Ventas por Cliente</CardTitle>
              <CardDescription>
                Ranking de clientes por volumen de ventas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Trabajos</TableHead>
                    <TableHead>Ingresos</TableHead>
                    <TableHead>Última Orden</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesByClient.map((client, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {client.clientName}
                      </TableCell>
                      <TableCell>{client.totalJobs}</TableCell>
                      <TableCell>
                        ${client.totalRevenue.toLocaleString()}
                      </TableCell>
                      <TableCell>{client.lastOrder}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            client.status === "active" ? "success" : "secondary"
                          }
                        >
                          {client.status === "active" ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="references">
          <Card>
            <CardHeader>
              <CardTitle>Ventas por Referencia</CardTitle>
              <CardDescription>
                Análisis de ventas por tipo de producto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Ingresos</TableHead>
                    <TableHead>Precio Promedio</TableHead>
                    <TableHead>Órdenes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesByReference.map((ref, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {ref.reference}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ref.type === "card" ? "default" : "secondary"
                          }
                        >
                          {ref.type === "card" ? "Tarjeta" : "Volante"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ref.totalQuantity.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ${ref.totalRevenue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ${ref.averagePrice.toLocaleString()}
                      </TableCell>
                      <TableCell>{ref.orders}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
