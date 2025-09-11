"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Package,
  Calendar,
  Clock,
  User,
  FileText,
  DollarSign,
} from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

interface JobDetails {
  id: string;
  consecutivo: string;
  cliente_nombre: string;
  trabajo: string;
  millares: number;
  estado: string;
  saldo_actual: number;
  fecha_recepcion: string;
  fecha_estimada_entrega: string;
  tracking_token: string;
  client: {
    empresa: string;
    whatsapp: string;
  };
}

const ESTADOS = [
  {
    key: "recibido",
    label: "Recibido",
    description: "Tu trabajo ha sido recibido y será programado",
  },
  {
    key: "finalizado",
    label: "Finalizado",
    description: "El diseño ha sido revisado y ajustado para montaje",
  },
  {
    key: "montado",
    label: "Montado",
    description: "Tu trabajo está montado en el cupo de producción",
  },
  {
    key: "impreso",
    label: "Impreso",
    description:
      "Tu trabajo ha sido impreso exitosamente (se le están haciendo las terminaciones)",
  },
  {
    key: "empacado",
    label: "Empacado",
    description: "Tu trabajo está LISTO PARA ENTREGA",
  },
];

export default function TrackPage() {
  const params = useParams();
  const token = params.token as string;
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const supabase = createClient();

  useEffect(() => {
    if (token) {
      loadJobDetails();
    }
  }, [token]);

  const loadJobDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(
          `
          *,
          client:clients(empresa, whatsapp)
        `
        )
        .eq("tracking_token", token)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          setError(
            "Trabajo no encontrado. Verifica que el enlace sea correcto."
          );
        } else {
          setError("Error al cargar la información del trabajo.");
        }
        return;
      }

      // Mapear los datos para incluir cliente_nombre
      const jobData = {
        ...data,
        cliente_nombre: data.client?.empresa || "Cliente no encontrado",
      };
      setJob(jobData);
    } catch (err) {
      setError("Error inesperado. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const getEstadoIndex = (estado: string) => {
    return ESTADOS.findIndex((e) => e.key === estado);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando información del trabajo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Trabajo no encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              No se encontró información para este trabajo.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentEstadoIndex = getEstadoIndex(job.estado);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-center mb-2">
            <Package className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">T&V Cupos</h1>
          </div>
          <p className="text-center text-gray-600 text-sm">
            Seguimiento de Trabajo
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Información del Trabajo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Información del Trabajo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Cliente:</span>
              <span className="font-medium">{job.cliente_nombre || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trabajo:</span>
              <span className="font-medium">{job.trabajo || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Millares:</span>
              <span className="font-medium">
                {job.millares ? job.millares.toLocaleString() : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Consecutivo:</span>
              <span className="font-medium text-blue-600">
                #{job.consecutivo || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Saldo Actual:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(job.saldo_actual || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Fechas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Fechas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Fecha de Recepción:</span>
              <span className="font-medium">
                {job.fecha_recepcion ? formatDate(job.fecha_recepcion) : "N/A"}
              </span>
            </div>
            {job.fecha_estimada_entrega && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Fecha Estimada de Entrega:
                </span>
                <span className="font-medium text-blue-600">
                  {formatDate(job.fecha_estimada_entrega)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estado Actual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Estado Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <Badge
                variant="outline"
                className={`text-lg px-4 py-2 ${
                  currentEstadoIndex >= 0
                    ? "bg-blue-100 text-blue-800 border-blue-300"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {ESTADOS.find((e) => e.key === job.estado)?.label || job.estado}
              </Badge>
              <p className="text-sm text-gray-600 mt-2">
                {ESTADOS.find((e) => e.key === job.estado)?.description ||
                  "Estado no reconocido"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Progreso de Estados */}
        <Card>
          <CardHeader>
            <CardTitle>Progreso del Trabajo</CardTitle>
            <CardDescription>Estados completados y pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ESTADOS.map((estado, index) => {
                const isCompleted = index <= currentEstadoIndex;
                const isCurrent = index === currentEstadoIndex;

                return (
                  <div key={estado.key} className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div
                        className={`font-medium ${
                          isCurrent
                            ? "text-blue-600 font-bold"
                            : isCompleted
                            ? "text-green-700"
                            : "text-gray-500"
                        }`}
                      >
                        {estado.label}
                      </div>
                      <div
                        className={`text-xs ${
                          isCompleted ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {estado.description}
                      </div>
                    </div>
                    {isCompleted && <div className="text-green-500">✓</div>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 py-4">
          <p>Sistema de Seguimiento T&V Cupos</p>
          <p>Para consultas, contacta a tu ejecutivo comercial</p>
        </div>
      </div>
    </div>
  );
}
