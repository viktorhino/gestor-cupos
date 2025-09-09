"use client";

import { JobWithDetails, CardSpecialFinish } from "@/lib/types/database";
import { jobService } from "@/lib/services/jobs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  User,
  Package,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useState } from "react";
import { specialFinishService } from "@/lib/services/special-finishes";
import { SpecialFinish } from "@/lib/services/special-finishes";
import { ImageModal } from "@/components/ui/image-modal";

interface JobDetailsModalProps {
  job: JobWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (job: JobWithDetails) => void;
  onDelete?: (job: JobWithDetails) => void;
}

export function JobDetailsModal({
  job,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: JobDetailsModalProps) {
  const [specialFinishes, setSpecialFinishes] = useState<CardSpecialFinish[]>(
    []
  );
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  useEffect(() => {
    const loadSpecialFinishes = async () => {
      try {
        const finishes = await specialFinishService.getSpecialFinishes();
        setSpecialFinishes(finishes);
      } catch (error) {
        console.error("Error loading special finishes:", error);
      }
    };

    if (isOpen) {
      loadSpecialFinishes();
    }
  }, [isOpen]);

  // Cargar pagos del trabajo
  useEffect(() => {
    const loadPayments = async () => {
      if (!job?.id) return;

      setLoadingPayments(true);
      try {
        const jobPayments = await jobService.getJobPayments(job.id);
        setPayments(jobPayments);
      } catch (error) {
        console.error("Error loading payments:", error);
      } finally {
        setLoadingPayments(false);
      }
    };

    loadPayments();
  }, [job?.id]);

  if (!job) return null;

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getJobTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "tarjetas":
        return "🃏";
      case "volantes":
        return "📄";
      default:
        return "📋";
    }
  };

  const calculateTotalCupos = () => {
    return (job.ocupacion_cupo || 0) * (job.cantidad_millares || 0);
  };

  const calculateTotalEstimado = () => {
    let total = 0;
    const cantidadMillares = job.cantidad_millares || 0;
    const ocupacionCupo = job.ocupacion_cupo || 0;
    const es_1x2 = job.es_1x2 || false;

    // Costo base de la tarjeta o volante (precio × millares × cupos)
    if (job.card_reference) {
      const millaresParaPrecio = es_1x2
        ? cantidadMillares / 2
        : cantidadMillares;
      total +=
        (job.card_reference.precio_base_por_millar || 0) *
        millaresParaPrecio *
        ocupacionCupo;
    }
    if (job.flyer_type) {
      const millaresParaPrecio = es_1x2
        ? cantidadMillares / 2
        : cantidadMillares;
      total +=
        (job.flyer_type.precio_base_por_millar || 0) *
        millaresParaPrecio *
        ocupacionCupo;
    }

    // Costo de terminaciones especiales (precio × millares) - NO se divide por 1x2
    if (
      job.terminaciones_especiales &&
      job.terminaciones_especiales.length > 0
    ) {
      job.terminaciones_especiales.forEach((finish) => {
        const specialFinish = specialFinishes.find(
          (sf) => sf.id === finish.tipo
        );
        if (specialFinish) {
          total +=
            (specialFinish.precio_unit_por_millar || 0) * cantidadMillares;
        }
      });
    }

    // Aplicar descuento si existe
    const descuento = job.descuento || 0;
    return total - descuento;
  };

  const getSpecialFinishName = (finishId: string) => {
    const finish = specialFinishes.find((f) => f.id === finishId);
    return finish ? finish.nombre : finishId;
  };

  const getBaseItemName = () => {
    if (job.card_reference) {
      return job.card_reference.nombre;
    }
    if (job.flyer_type) {
      return `${job.flyer_type.tamaño} - ${job.flyer_type.modo}`;
    }
    return "No especificado";
  };

  const getBaseItemPrice = () => {
    if (job.card_reference) {
      return job.card_reference.precio_base_por_millar || 0;
    }
    if (job.flyer_type) {
      return job.flyer_type.precio_base_por_millar || 0;
    }
    return 0;
  };

  const calculateSaldoPendiente = () => {
    const total = calculateTotalEstimado();
    const totalAbonos = payments.reduce(
      (sum, payment) => sum + (payment.monto || 0),
      0
    );
    return total - totalAbonos;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-100">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getJobTypeIcon(job.tipo)}</span>
              <span>{job.nombre_trabajo}</span>
            </div>
            <div className="flex items-center gap-2">
              {job.imagen_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setImageModalOpen(true)}
                  className="flex items-center gap-1"
                >
                  <ImageIcon className="h-4 w-4" />
                  Ver Imagen
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Primera sección: Datos generales */}
          <Card className="bg-white">
            <CardContent className="space-y-4 px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium">
                      {job.client?.empresa || "No especificado"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Nombre del Trabajo
                    </p>
                    <p className="font-medium">{job.nombre_trabajo}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Fecha de Recepción
                    </p>
                    <p className="font-medium">
                      {format(new Date(job.created_at), "dd MMM yyyy, HH:mm", {
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Costo Total</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${formatNumber(calculateTotalEstimado())}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Segunda sección: Detalles del trabajo */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Detalles del Trabajo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Tipo de Trabajo
                  </p>
                  <p className="font-medium capitalize">{job.tipo}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    {job.tipo === "tarjetas"
                      ? "Terminación"
                      : "Tamaño y Tintas"}
                  </p>
                  <p className="font-medium">{getBaseItemName()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cupos</p>
                  <p className="font-medium">{job.ocupacion_cupo || 0}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Millares</p>
                  <p className="font-medium">{job.cantidad_millares || 0}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">1x2</p>
                  <p className="font-medium">{job.es_1x2 ? "Sí" : "No"}</p>
                </div>
              </div>

              {job.terminaciones_especiales &&
                job.terminaciones_especiales.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Terminaciones Especiales
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {job.terminaciones_especiales.map((finish, index) => (
                        <Badge key={index} variant="secondary">
                          {getSpecialFinishName(finish.tipo)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {job.observaciones && (
                <div>
                  <p className="text-sm text-muted-foreground">Observaciones</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-md">
                    {job.observaciones}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tercera sección: Desglose de costos */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Desglose de Costos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-gray-50 p-4 space-y-2">
                {/* Costo base */}
                <div className="flex justify-between items-center py-2">
                  <div>
                    <p className="font-medium text-sm">{getBaseItemName()}</p>
                    <p className="text-xs text-muted-foreground">
                      ${formatNumber(getBaseItemPrice())} ×{" "}
                      {job.es_1x2
                        ? (job.cantidad_millares || 0) / 2
                        : job.cantidad_millares}{" "}
                      millares × {job.ocupacion_cupo} cupos
                      {job.es_1x2 && (
                        <span className="text-blue-600 font-medium">
                          {" "}
                          (1x2 aplicado)
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="font-bold text-sm">
                    $
                    {formatNumber(
                      getBaseItemPrice() *
                        (job.es_1x2
                          ? (job.cantidad_millares || 0) / 2
                          : job.cantidad_millares || 0) *
                        (job.ocupacion_cupo || 0)
                    )}
                  </p>
                </div>

                {/* Terminaciones especiales */}
                {job.terminaciones_especiales &&
                  job.terminaciones_especiales.length > 0 && (
                    <>
                      {job.terminaciones_especiales.map((finish, index) => {
                        const specialFinish = specialFinishes.find(
                          (sf) => sf.id === finish.tipo
                        );
                        const price =
                          specialFinish?.precio_unit_por_millar || 0;
                        const total = price * (job.cantidad_millares || 0);

                        return (
                          <div
                            key={index}
                            className="flex justify-between items-center py-2"
                          >
                            <div>
                              <p className="font-medium text-sm">
                                {getSpecialFinishName(finish.tipo)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ${formatNumber(price)} × {job.cantidad_millares}{" "}
                                millares
                              </p>
                            </div>
                            <p className="font-bold text-sm">
                              ${formatNumber(total)}
                            </p>
                          </div>
                        );
                      })}
                    </>
                  )}

                {/* Descuento */}
                {job.descuento && job.descuento > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium text-sm text-red-700">
                        Descuento
                      </p>
                    </div>
                    <p className="font-bold text-sm text-red-700">
                      -${formatNumber(job.descuento)}
                    </p>
                  </div>
                )}

                {/* Total */}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <p className="font-bold">Total</p>
                    <p className="text-xl font-bold text-green-600">
                      ${formatNumber(calculateTotalEstimado())}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cuarta sección: Historial de pagos */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Historial de Pagos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-gray-50 p-4 space-y-3">
                {/* Total del trabajo */}
                <div className="flex justify-between items-center py-2 border-b">
                  <p className="font-medium text-sm">Total del Trabajo</p>
                  <p className="font-bold text-sm">
                    ${formatNumber(calculateTotalEstimado())}
                  </p>
                </div>

                {/* Abonos realizados */}
                {loadingPayments ? (
                  <div className="flex justify-center items-center py-2">
                    <p className="text-sm text-muted-foreground">
                      Cargando pagos...
                    </p>
                  </div>
                ) : payments.length > 0 ? (
                  <div className="space-y-2">
                    {payments.map((payment, index) => (
                      <div
                        key={payment.id || index}
                        className="flex justify-between items-center py-2 border-b border-gray-200"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            Pago #{index + 1}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Método: {payment.metodo}
                            {payment.observacion && ` - ${payment.observacion}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Fecha:{" "}
                            {new Date(payment.fecha).toLocaleDateString(
                              "es-ES"
                            )}
                          </p>
                        </div>
                        <p className="font-bold text-sm text-green-600">
                          -${formatNumber(payment.monto)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-between items-center py-2">
                    <p className="font-medium text-sm text-muted-foreground">
                      Sin abonos
                    </p>
                    <p className="font-bold text-sm text-muted-foreground">
                      $0
                    </p>
                  </div>
                )}

                {/* Saldo pendiente */}
                <div className="flex justify-between items-center py-2 border-t pt-3">
                  <p className="font-bold text-base">Saldo Pendiente</p>
                  <p
                    className={`text-lg font-bold ${
                      calculateSaldoPendiente() > 0
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    ${formatNumber(calculateSaldoPendiente())}
                  </p>
                </div>

                {/* Estado del pago */}
                <div className="text-center pt-2">
                  {calculateSaldoPendiente() === 0 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Pagado Completamente
                    </span>
                  ) : calculateSaldoPendiente() < calculateTotalEstimado() ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pago Parcial
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Sin Pago
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-4">
            {onEdit && (
              <Button variant="outline" onClick={() => onEdit(job)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={() => onDelete(job)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            )}
          </div>
        </div>

        {/* Modal de imagen */}
        {imageModalOpen && job.imagen_url && (
          <ImageModal
            isOpen={imageModalOpen}
            onClose={() => setImageModalOpen(false)}
            imageUrl={job.imagen_url}
            title={`Imagen del trabajo: ${job.nombre_trabajo}`}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
