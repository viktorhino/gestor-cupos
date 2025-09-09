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
  TrendingDown,
  DollarSign,
  Package,
  Calculator,
} from "lucide-react";

interface CostData {
  period: string;
  totalBatches: number;
  totalCost: number;
  totalRevenue: number;
  grossMargin: number;
  marginPercentage: number;
  averageCostPerBatch: number;
  mostExpensiveBatch: string;
  cheapestBatch: string;
}

interface BatchCost {
  id: string;
  date: string;
  type: "card" | "flyer";
  group: string;
  totalPieces: number;
  totalCost: number;
  totalRevenue: number;
  margin: number;
  marginPercentage: number;
  costBreakdown: {
    paper: number;
    plates: number;
    printing: number;
    basicFinish: number;
    specialFinish: number;
    trimming: number;
    other: number;
  };
}

interface CostBySupplier {
  supplierName: string;
  totalJobs: number;
  totalCost: number;
  averageCost: number;
  lastJob: string;
  status: "active" | "inactive";
}

export function CostReport() {
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [reportData, setReportData] = useState<CostData>({
    period: "Enero 2024",
    totalBatches: 15,
    totalCost: 450000,
    totalRevenue: 1250000,
    grossMargin: 800000,
    marginPercentage: 64,
    averageCostPerBatch: 30000,
    mostExpensiveBatch: "BATCH-001",
    cheapestBatch: "BATCH-015",
  });

  const [batchCosts] = useState<BatchCost[]>([
    {
      id: "BATCH-001",
      date: "2024-01-15",
      type: "card",
      group: "brillo",
      totalPieces: 30000,
      totalCost: 45000,
      totalRevenue: 120000,
      margin: 75000,
      marginPercentage: 62.5,
      costBreakdown: {
        paper: 15000,
        plates: 5000,
        printing: 12000,
        basicFinish: 8000,
        specialFinish: 3000,
        trimming: 2000,
        other: 0,
      },
    },
    {
      id: "BATCH-002",
      date: "2024-01-14",
      type: "flyer",
      group: "media_carta",
      totalPieces: 25000,
      totalCost: 28000,
      totalRevenue: 75000,
      margin: 47000,
      marginPercentage: 62.7,
      costBreakdown: {
        paper: 10000,
        plates: 3000,
        printing: 8000,
        basicFinish: 5000,
        specialFinish: 0,
        trimming: 2000,
        other: 0,
      },
    },
    {
      id: "BATCH-003",
      date: "2024-01-13",
      type: "card",
      group: "mate_reserva",
      totalPieces: 20000,
      totalCost: 32000,
      totalRevenue: 80000,
      margin: 48000,
      marginPercentage: 60,
      costBreakdown: {
        paper: 12000,
        plates: 4000,
        printing: 10000,
        basicFinish: 4000,
        specialFinish: 1000,
        trimming: 1000,
        other: 0,
      },
    },
  ]);

  const [costsBySupplier] = useState<CostBySupplier[]>([
    {
      supplierName: "Impresiones Pro S.A.S.",
      totalJobs: 8,
      totalCost: 180000,
      averageCost: 22500,
      lastJob: "2024-01-10",
      status: "active",
    },
    {
      supplierName: "Terminaciones Plus",
      totalJobs: 5,
      totalCost: 95000,
      averageCost: 19000,
      lastJob: "2024-01-08",
      status: "active",
    },
    {
      supplierName: "Corte y Troquelado",
      totalJobs: 3,
      totalCost: 45000,
      averageCost: 15000,
      lastJob: "2024-01-05",
      status: "inactive",
    },
  ]);

  const handleGenerateReport = () => {
    console.log("Generando reporte de costos...", {
      dateRange,
      selectedPeriod,
    });
  };

  const handleExportPDF = () => {
    console.log("Exportando reporte de costos a PDF...");
  };

  const handleExportExcel = () => {
    console.log("Exportando reporte de costos a Excel...");
  };

  const getMarginBadgeVariant = (percentage: number) => {
    if (percentage >= 60) return "success";
    if (percentage >= 40) return "warning";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reporte de Costos</h2>
          <p className="text-muted-foreground">
            Análisis de costos por cupo, proveedor y margen de ganancia
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
            Selecciona el período para el análisis de costos
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
            <CardTitle className="text-sm font-medium">Total Cupos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalBatches}</div>
            <p className="text-xs text-muted-foreground">+3 vs mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${reportData.totalCost.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+5% vs mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen Bruto</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${reportData.grossMargin.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {reportData.marginPercentage}% de margen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Costo Promedio
            </CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${reportData.averageCostPerBatch.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">por cupo</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="batches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="batches">Por Cupo</TabsTrigger>
          <TabsTrigger value="suppliers">Por Proveedor</TabsTrigger>
        </TabsList>

        <TabsContent value="batches">
          <Card>
            <CardHeader>
              <CardTitle>Costos por Cupo</CardTitle>
              <CardDescription>
                Desglose detallado de costos por cupo de producción
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cupo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Piezas</TableHead>
                    <TableHead>Costo Total</TableHead>
                    <TableHead>Ingresos</TableHead>
                    <TableHead>Margen</TableHead>
                    <TableHead>% Margen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchCosts.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{batch.id}</TableCell>
                      <TableCell>{batch.date}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            batch.type === "card" ? "default" : "secondary"
                          }
                        >
                          {batch.type === "card" ? "Tarjeta" : "Volante"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {batch.totalPieces.toLocaleString()}
                      </TableCell>
                      <TableCell>${batch.totalCost.toLocaleString()}</TableCell>
                      <TableCell>
                        ${batch.totalRevenue.toLocaleString()}
                      </TableCell>
                      <TableCell>${batch.margin.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getMarginBadgeVariant(
                            batch.marginPercentage
                          )}
                        >
                          {batch.marginPercentage}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <CardTitle>Costos por Proveedor</CardTitle>
              <CardDescription>
                Análisis de costos de tercerización por proveedor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Trabajos</TableHead>
                    <TableHead>Costo Total</TableHead>
                    <TableHead>Costo Promedio</TableHead>
                    <TableHead>Último Trabajo</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costsBySupplier.map((supplier, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {supplier.supplierName}
                      </TableCell>
                      <TableCell>{supplier.totalJobs}</TableCell>
                      <TableCell>
                        ${supplier.totalCost.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ${supplier.averageCost.toLocaleString()}
                      </TableCell>
                      <TableCell>{supplier.lastJob}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            supplier.status === "active"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {supplier.status === "active" ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
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



