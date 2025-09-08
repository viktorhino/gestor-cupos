"use client";

// Forzar renderizado dinámico para evitar problemas con variables de entorno
export const dynamic = "force-dynamic";

import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { ClientsSidebar } from "@/components/clients/clients-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Truck,
  Calendar,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
} from "lucide-react";
import { useJobs } from "@/lib/hooks/use-jobs";
import { useEffect, useState } from "react";

// Función para obtener el badge de estado
const getStatusBadge = (estado: string) => {
  const statusConfig = {
    recibido: { variant: "secondary" as const, label: "Recibido" },
    en_preprensa: { variant: "outline" as const, label: "En Preprensa" },
    pendiente_de_montaje: {
      variant: "warning" as const,
      label: "Pendiente Montaje",
    },
    en_cupo: { variant: "info" as const, label: "En Cupo" },
    impreso: { variant: "secondary" as const, label: "Impreso" },
    terminado: { variant: "secondary" as const, label: "Terminado" },
    listo_para_entrega: { variant: "success" as const, label: "Listo Entrega" },
    entregado: { variant: "default" as const, label: "Entregado" },
  };

  const config =
    statusConfig[estado as keyof typeof statusConfig] || statusConfig.recibido;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

// Función para calcular estadísticas del dashboard
const calculateDashboardStats = (jobs: any[]) => {
  const stats = {
    tarjetas: {
      brillo: { pendientes_montar: 0, en_cupo: 0, listas_entrega: 0 },
      mate_reserva: { pendientes_montar: 0, en_cupo: 0, listas_entrega: 0 },
    },
    volantes: { media: 0, cuarto: 0, mini: 0 },
    pendientes_entrega: 0,
    cupos_hoy: 0,
  };

  jobs.forEach((job) => {
    if (job.tipo === "tarjetas") {
      job.job_items?.forEach((item: any) => {
        if (item.card_references?.grupo === "brillo") {
          if (item.estado === "pendiente_de_montaje")
            stats.tarjetas.brillo.pendientes_montar += item.cantidad_millares;
          if (item.estado === "en_cupo")
            stats.tarjetas.brillo.en_cupo += item.cantidad_millares;
          if (item.estado === "listo_para_entrega")
            stats.tarjetas.brillo.listas_entrega += item.cantidad_millares;
        } else if (item.card_references?.grupo === "mate_reserva") {
          if (item.estado === "pendiente_de_montaje")
            stats.tarjetas.mate_reserva.pendientes_montar +=
              item.cantidad_millares;
          if (item.estado === "en_cupo")
            stats.tarjetas.mate_reserva.en_cupo += item.cantidad_millares;
          if (item.estado === "listo_para_entrega")
            stats.tarjetas.mate_reserva.listas_entrega +=
              item.cantidad_millares;
        }
      });
    } else if (job.tipo === "volantes") {
      job.job_items?.forEach((item: any) => {
        if (item.flyer_types?.tamaño === "media")
          stats.volantes.media += item.cantidad_millares;
        if (item.flyer_types?.tamaño === "cuarto")
          stats.volantes.cuarto += item.cantidad_millares;
        if (item.flyer_types?.tamaño === "mini")
          stats.volantes.mini += item.cantidad_millares;
      });
    }

    if (job.estado === "listo_para_entrega") {
      stats.pendientes_entrega += 1;
    }
  });

  // Contar cupos del día (simplificado)
  const today = new Date().toISOString().split("T")[0];
  stats.cupos_hoy = jobs.filter((job) =>
    job.fecha_recepcion?.startsWith(today)
  ).length;

  return stats;
};

export default function DashboardPage() {
  const { jobs, loading, error } = useJobs();
  const [dashboardStats, setDashboardStats] = useState({
    tarjetas: {
      brillo: { pendientes_montar: 0, en_cupo: 0, listas_entrega: 0 },
      mate_reserva: { pendientes_montar: 0, en_cupo: 0, listas_entrega: 0 },
    },
    volantes: { media: 0, cuarto: 0, mini: 0 },
    pendientes_entrega: 0,
    cupos_hoy: 0,
  });
  const [isClientsSidebarOpen, setIsClientsSidebarOpen] = useState(false);

  useEffect(() => {
    if (jobs.length > 0) {
      const stats = calculateDashboardStats(jobs);
      setDashboardStats(stats);
    }
  }, [jobs]);

  if (loading) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Cargando dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-8">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">
                Error al cargar datos
              </CardTitle>
              <CardDescription className="text-red-600">
                {error}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pendientes de Montar
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.tarjetas.brillo.pendientes_montar +
                  dashboardStats.tarjetas.mate_reserva.pendientes_montar}
              </div>
              <p className="text-xs text-muted-foreground">
                Tarjetas pendientes de montaje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Cupo</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.tarjetas.brillo.en_cupo +
                  dashboardStats.tarjetas.mate_reserva.en_cupo}
              </div>
              <p className="text-xs text-muted-foreground">
                Tarjetas en proceso de cupo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Listas para Entrega
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.pendientes_entrega}
              </div>
              <p className="text-xs text-muted-foreground">
                Trabajos listos para entregar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cupos Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.cupos_hoy}
              </div>
              <p className="text-xs text-muted-foreground">Cupos creados hoy</p>
            </CardContent>
          </Card>
        </div>

        {/* Detalle por tipo de tarjeta */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Tarjetas Brillo UV</CardTitle>
              <CardDescription>Estado de producción</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Pendientes de montar:</span>
                  <Badge variant="warning">
                    {dashboardStats.tarjetas.brillo.pendientes_montar}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">En cupo:</span>
                  <Badge variant="info">
                    {dashboardStats.tarjetas.brillo.en_cupo}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Listas para entrega:</span>
                  <Badge variant="success">
                    {dashboardStats.tarjetas.brillo.listas_entrega}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tarjetas Mate-Reserva</CardTitle>
              <CardDescription>Estado de producción</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Pendientes de montar:</span>
                  <Badge variant="warning">
                    {dashboardStats.tarjetas.mate_reserva.pendientes_montar}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">En cupo:</span>
                  <Badge variant="info">
                    {dashboardStats.tarjetas.mate_reserva.en_cupo}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Listas para entrega:</span>
                  <Badge variant="success">
                    {dashboardStats.tarjetas.mate_reserva.listas_entrega}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Volantes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Volantes</CardTitle>
            <CardDescription>Distribución por tamaño</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {dashboardStats.volantes.media}
                </div>
                <p className="text-sm text-muted-foreground">Media Carta</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {dashboardStats.volantes.cuarto}
                </div>
                <p className="text-sm text-muted-foreground">Cuarto Carta</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {dashboardStats.volantes.mini}
                </div>
                <p className="text-sm text-muted-foreground">Mini Volante</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trabajos recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Trabajos Recientes</CardTitle>
            <CardDescription>Últimos trabajos registrados</CardDescription>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay trabajos registrados
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.slice(0, 5).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">
                          #{job.consecutivo} - {job.tipo}
                        </p>
                        <p className="text-sm text-gray-500">
                          {job.client?.empresa} •{" "}
                          {new Date(job.fecha_recepcion).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(job.estado)}
                      <span className="text-sm font-medium">
                        ${job.total_estimado?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones rápidas */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/trabajos">
            <Button>
              <Package className="mr-2 h-4 w-4" />
              Trabajos
            </Button>
          </Link>
          <Link href="/deliveries">
            <Button variant="outline">
              <Truck className="mr-2 h-4 w-4" />
              Entregas
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => setIsClientsSidebarOpen(true)}
          >
            <Users className="mr-2 h-4 w-4" />
            Clientes
          </Button>
          <Link href="/planner">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Planificador
            </Button>
          </Link>
          <Link href="/batches">
            <Button variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Historial Cupos
            </Button>
          </Link>
        </div>
      </div>

      <ClientsSidebar
        isOpen={isClientsSidebarOpen}
        onClose={() => setIsClientsSidebarOpen(false)}
      />
    </MainLayout>
  );
}
