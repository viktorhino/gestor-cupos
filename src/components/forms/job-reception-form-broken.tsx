"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Plus,
  Calculator,
  CreditCard,
  Check,
  ChevronsUpDown,
  UserPlus,
} from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { storageService } from "@/lib/services/storage";
import { toast } from "sonner";
import { useClients } from "@/lib/hooks/use-clients";
import { cardReferenceService } from "@/lib/services/card-references";
import { flyerTypeService } from "@/lib/services/flyer-types";
import {
  specialFinishService,
  SpecialFinish,
} from "@/lib/services/special-finishes";
import { paymentService } from "@/lib/services/payments";
import { jobService } from "@/lib/services/jobs";
import { JobWithDetails, JobFormData } from "@/lib/types/database";

// Schema simplificado - todo en un solo objeto
const jobFormSchema = z.object({
  client_id: z.string().min(1, "Debe seleccionar un cliente"),
  nombre_trabajo: z.string().min(1, "Debe ingresar el nombre del trabajo"),
  tipo: z.enum(["tarjetas", "volantes"]),
  // Campos consolidados
  card_reference_id: z.string().optional(),
  flyer_type_id: z.string().optional(),
  ocupacion_cupo: z.number().min(1),
  cantidad_millares: z.number().min(1),
  terminaciones_especiales: z
    .array(
      z.object({
        tipo: z.string(),
        precio: z.number(),
        parametros: z.any().optional(),
      })
    )
    .default([]),
  observaciones: z.string().optional(),
  imagen_url: z.string().optional(),
  notas: z.string().optional(),
  descuento: z.number().min(0, "El descuento no puede ser negativo").optional(),
  abono: z
    .object({
      monto: z.number().min(0),
      metodo: z.enum(["efectivo", "transferencia", "cheque", "tarjeta"]),
      observacion: z.string().optional(),
    })
    .optional(),
});

interface JobReceptionFormProps {
  initialData?: JobWithDetails | null;
  onJobSaved?: (job: JobWithDetails) => void;
  onCancel?: () => void;
}

export function JobReceptionForm({
  initialData,
  onJobSaved,
  onCancel,
}: JobReceptionFormProps = {}) {
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [clientSearchValue, setClientSearchValue] = useState("");
  const [jobType, setJobType] = useState<"tarjetas" | "volantes">("tarjetas");
  const [totalCalculated, setTotalCalculated] = useState(0);
  const [clientComboOpen, setClientComboOpen] = useState(false);
  const [newClientDialog, setNewClientDialog] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientWhatsapp, setNewClientWhatsapp] = useState("");
  const [newClientObservaciones, setNewClientObservaciones] = useState("");
  const [cardReferences, setCardReferences] = useState<any[]>([]);
  const [flyerTypes, setFlyerTypes] = useState<any[]>([]);
  const [specialFinishes, setSpecialFinishes] = useState<SpecialFinish[]>([]);
  const [loading, setLoading] = useState(true);

  const { clients, loading: clientsLoading, refreshClients } = useClients();

  // Debug: Log clients when they change
  useEffect(() => {
    console.log("Clients loaded:", clients);
  }, [clients]);

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      client_id: "",
      nombre_trabajo: "",
      tipo: "tarjetas",
      ocupacion_cupo: 1,
      cantidad_millares: 1,
      terminaciones_especiales: [],
      observaciones: "",
      imagen_url: "",
      notas: "",
      descuento: 0,
      abono: {
        monto: 0,
        metodo: "efectivo",
        observacion: "",
      },
    },
  });

  const watchJobType = form.watch("tipo");
  const watchCupos = form.watch("ocupacion_cupo");
  const watchMillares = form.watch("cantidad_millares");

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        const [cardRefs, flyerTypesData, specialFinishesData] =
          await Promise.all([
            cardReferenceService.getCardReferences(),
            flyerTypeService.getFlyerTypes(),
            specialFinishService.getSpecialFinishes(),
          ]);

        setCardReferences(cardRefs);
        setFlyerTypes(flyerTypesData);
        setSpecialFinishes(specialFinishesData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Pre-llenar formulario cuando hay initialData (modo edición)
  useEffect(() => {
    if (initialData && cardReferences.length > 0 && flyerTypes.length > 0) {
      console.log("Pre-llenando formulario con initialData:", initialData);

      const formData: JobFormData = {
        client_id: initialData.client_id ?? "",
        nombre_trabajo: initialData.nombre_trabajo ?? "",
        tipo: initialData.tipo,
        // Campos consolidados
        card_reference_id: initialData.card_reference_id ?? "",
        flyer_type_id: initialData.flyer_type_id ?? "",
        ocupacion_cupo: initialData.ocupacion_cupo ?? 1,
        cantidad_millares: initialData.cantidad_millares ?? 1,
        terminaciones_especiales: initialData.terminaciones_especiales ?? [],
        observaciones: initialData.observaciones ?? "",
        imagen_url: initialData.imagen_url ?? "",
        notas: initialData.notas ?? "",
        descuento: initialData.descuento ?? 0,
        abono: {
          monto: initialData.payments?.[0]?.monto ?? 0,
          metodo: (initialData.payments?.[0]?.metodo ?? "efectivo") as
            | "efectivo"
            | "transferencia"
            | "cheque"
            | "tarjeta",
          observacion: initialData.payments?.[0]?.observacion ?? "",
        },
      };

      console.log("Datos del formulario a resetear:", formData);
      form.reset(formData);
      setSelectedClient(initialData.client.empresa);
      setJobType(initialData.tipo);
    }
  }, [initialData, cardReferences, flyerTypes, form]);

  // Calcular totales
  const calculateTotals = useCallback(() => {
    const cupos = watchCupos || 1;
    const millares = watchMillares || 1;
    const terminaciones = form.watch("terminaciones_especiales") || [];
    const descuento = form.watch("descuento") || 0;

    let total = 0;

    if (watchJobType === "tarjetas") {
      const cardRefId = form.watch("card_reference_id");
      const cardRef = cardReferences.find((ref) => ref.id === cardRefId);
      if (cardRef) {
        total = cardRef.precio_base_por_millar * millares;
      }
    } else if (watchJobType === "volantes") {
      const flyerTypeId = form.watch("flyer_type_id");
      const flyerType = flyerTypes.find((type) => type.id === flyerTypeId);
      if (flyerType) {
        total = flyerType.precio_base_por_millar * millares;
      }
    }

    // Agregar terminaciones especiales
    terminaciones.forEach((terminacion: any) => {
      const specialFinish = specialFinishes.find(
        (sf) => sf.id === terminacion.tipo
      );
      if (specialFinish) {
        total += specialFinish.precio_unit_por_millar * millares;
      }
    });

    const totalConDescuento = total - descuento;
    setTotalCalculated(totalConDescuento);
  }, [
    watchJobType,
    watchCupos,
    watchMillares,
    cardReferences,
    flyerTypes,
    specialFinishes,
    form,
  ]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const onSubmit = async (data: JobFormData) => {
    try {
      console.log("Submitting job form:", data);

      if (initialData) {
        // Editar trabajo existente
        const updatedJob = await jobService.updateJob(initialData.id, data);
        if (!updatedJob) {
          toast.error("Error al actualizar el trabajo");
          return;
        }

        // Manejar pagos
        if (data.abono && data.abono.monto > 0) {
          const existingPayments = await paymentService.getPaymentsByJobId(
            initialData.id
          );
          if (existingPayments.length > 0) {
            await paymentService.updatePayment(existingPayments[0].id, {
              monto: data.abono.monto,
              metodo: data.abono.metodo,
              observacion: data.abono.observacion,
            });
          } else {
            await paymentService.createPayment({
              job_id: initialData.id,
              monto: data.abono.monto,
              metodo: data.abono.metodo,
              observacion: data.abono.observacion,
            });
          }
        } else if (data.abono && data.abono.monto === 0) {
          const existingPayments = await paymentService.getPaymentsByJobId(
            initialData.id
          );
          for (const payment of existingPayments) {
            await paymentService.deletePayment(payment.id);
          }
        }

        toast.success("Trabajo actualizado exitosamente");
        onJobSaved?.(updatedJob as JobWithDetails);
      } else {
        // Crear nuevo trabajo
        const job = await jobService.createJob(data);
        if (!job) {
          toast.error("Error al crear el trabajo");
          return;
        }

        // Si hay una imagen base64 temporal, subirla a Supabase Storage
        if (data.imagen_url && data.imagen_url.startsWith("data:image/")) {
          console.log("Starting image upload process...");
          try {
            const response = await fetch(data.imagen_url);
            const blob = await response.blob();
            const file = new File([blob], "work-image.png", {
              type: "image/png",
            });

            console.log("File created from base64, uploading to storage...");
            const imageUrl = await storageService.uploadWorkImage(file, job.id);
            console.log("Storage service returned:", imageUrl);

            if (imageUrl) {
              console.log(
                "Image uploaded successfully, updating job with URL:",
                imageUrl
              );
              const updatedJob = await jobService.updateJob(job.id, {
                imagen_url: imageUrl,
              });
              if (updatedJob) {
                console.log("Job updated with image URL successfully");
              } else {
                console.error("Failed to update job with image URL");
                toast.error(
                  "Error al guardar la URL de la imagen en la base de datos"
                );
              }
            } else {
              console.error(
                "Failed to upload image to storage - imageUrl is null/undefined"
              );
              toast.error("Error al subir la imagen al almacenamiento");
            }
          } catch (error) {
            console.error("Error uploading image:", error);
            toast.error(
              "Error al subir la imagen, pero el trabajo se creó correctamente"
            );
          }
        } else {
          console.log("No image to upload - imagen_url is not a base64 image");
        }

        // Manejar pagos
        if (data.abono && data.abono.monto > 0) {
          await paymentService.createPayment({
            job_id: job.id,
            monto: data.abono.monto,
            metodo: data.abono.metodo,
            observacion: data.abono.observacion,
          });
        }

        toast.success("Trabajo creado exitosamente");
        onJobSaved?.(job as JobWithDetails);
      }
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast.error("Error al procesar el formulario");
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Trabajo" : "Agregar Trabajo"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información del Cliente */}
            <Card className="bg-white">
              <CardContent className="space-y-4 px-6 py-2.5">
                {/* Cliente */}
                <FormField
                  control={form.control}
                  name="client_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente *</FormLabel>
                      <Popover
                        open={clientComboOpen}
                        onOpenChange={(open) => {
                          setClientComboOpen(open);
                          if (!open) {
                            setClientSearchValue("");
                          }
                        }}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between"
                            >
                              {selectedClient || "Seleccionar cliente..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput
                              placeholder="Buscar cliente..."
                              value={clientSearchValue}
                              onValueChange={setClientSearchValue}
                            />
                            <CommandGroup>
                              {(() => {
                                const filteredClients = clients.filter((client) =>
                                  client.empresa
                                    .toLowerCase()
                                    .includes(clientSearchValue.toLowerCase())
                                );
                                console.log("Filtered clients:", filteredClients);
                                return filteredClients.map((client) => (
                                  <CommandItem
                                    key={client.id}
                                    value={client.empresa}
                                    onSelect={(currentValue) => {
                                      console.log(
                                        "Selecting client:",
                                        client.empresa,
                                        "ID:",
                                        client.id
                                      );
                                      field.onChange(client.id);
                                      setSelectedClient(client.empresa);
                                      setClientComboOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        field.value === client.id
                                          ? "opacity-100"
                                          : "opacity-0"
                                      }`}
                                    />
                                    {client.empresa}
                                  </CommandItem>
                                ));
                              })()}
                            </CommandGroup>
                            <CommandEmpty>
                              <div className="flex items-center justify-center py-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setNewClientDialog(true)}
                                  className="flex items-center gap-2"
                                >
                                  <UserPlus className="h-4 w-4" />
                                  Agregar Cliente
                                </Button>
                              </div>
                            </CommandEmpty>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nombre del Trabajo */}
                <FormField
                  control={form.control}
                  name="nombre_trabajo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Trabajo *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nombre o titular más visible de la pieza"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Imagen del trabajo en modo edición - Integrada */}
                {initialData && initialData.imagen_url && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border">
                    <div className="flex-shrink-0">
                      <img
                        src={initialData.imagen_url}
                        alt="Imagen del trabajo"
                        className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        Imagen del Trabajo
                      </h4>
                      <p className="text-xs text-gray-500">
                        Imagen no editable en modo edición
                      </p>
                      <div className="mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(initialData.imagen_url, "_blank")
                          }
                          className="text-xs"
                        >
                          Ver imagen completa
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detalles del Trabajo */}
            <Card className="bg-white">
              <CardContent className="space-y-4 px-6 py-2.5">
                {/* Primera línea: Tipo de trabajo y Terminación */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de trabajo *</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setJobType(value as "tarjetas" | "volantes");
                            // Limpiar campos específicos del tipo
                            form.setValue("card_reference_id", "");
                            form.setValue("flyer_type_id", "");
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Tarjeta, volante, etc" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="tarjetas">Tarjetas</SelectItem>
                            <SelectItem value="volantes">Volantes</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchJobType === "tarjetas" ? (
                    <FormField
                      control={form.control}
                      name="card_reference_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Terminación *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Brillo, mate, reserva, etc" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cardReferences.map((ref) => (
                                <SelectItem key={ref.id} value={ref.id}>
                                  {ref.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormField
                      control={form.control}
                      name="flyer_type_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tamaño y Tintas *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="MediaC, CuartoDeC, etc" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {flyerTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Segunda línea: Cupos y Millares */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ocupacion_cupo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cupos *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="1"
                            {...field}
                            onChange={(e) => {
                              field.onChange(parseInt(e.target.value) || 1);
                              setTimeout(() => calculateTotals(), 100);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cantidad_millares"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Millares *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="1"
                            {...field}
                            onChange={(e) => {
                              field.onChange(parseInt(e.target.value) || 1);
                              setTimeout(() => calculateTotals(), 100);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Tercera línea: Terminaciones especiales */}
                {watchJobType === "tarjetas" && (
                  <div>
                    <Label className="text-sm font-medium">
                      Terminaciones Especiales
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {specialFinishes.map((finish) => (
                        <div
                          key={finish.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`item-${finish.id}`}
                            checked={
                              form
                                .watch("terminaciones_especiales")
                                ?.some((t) => t.tipo === finish.id) || false
                            }
                            onCheckedChange={(checked) => {
                              const currentFinishes =
                                form.watch("terminaciones_especiales") || [];
                              let newFinishes;

                              if (checked) {
                                newFinishes = [
                                  ...currentFinishes,
                                  {
                                    tipo: finish.id,
                                    precio: finish.precio_unit_por_millar,
                                    parametros: {},
                                  },
                                ];
                              } else {
                                newFinishes = currentFinishes.filter(
                                  (t) => t.tipo !== finish.id
                                );
                              }

                              form.setValue(
                                "terminaciones_especiales",
                                newFinishes
                              );
                              setTimeout(() => calculateTotals(), 100);
                            }}
                          />
                          <Label
                            htmlFor={`item-${finish.id}`}
                            className="text-sm"
                          >
                            {finish.nombre}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cuarta línea: Observaciones */}
                <FormField
                  control={form.control}
                  name="observaciones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observaciones adicionales..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Carga de imagen - Solo para trabajos nuevos */}
                {!initialData && (
                  <FormField
                    control={form.control}
                    name="imagen_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imagen del Trabajo</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value}
                            onChange={field.onChange}
                            className="max-w-md"
                            jobId="temp"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Información Financiera */}
            <Card className="bg-white">
              <CardContent className="space-y-4 px-6 py-2.5">
                {/* Primera línea: Valor estimado del trabajo */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">
                    Valor Estimado del Trabajo:
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    ${totalCalculated.toLocaleString()}
                  </span>
                </div>

                {/* Segunda línea: Descuento y Abono */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="descuento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descuento</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => {
                              field.onChange(parseFloat(e.target.value) || 0);
                              setTimeout(() => calculateTotals(), 100);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="abono.monto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Abono</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => {
                              field.onChange(parseFloat(e.target.value) || 0);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Tercera línea: Saldo */}
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium">Saldo:</span>
                  <span className="text-lg font-bold text-orange-600">
                    $
                    {(
                      totalCalculated - (form.watch("abono.monto") || 0)
                    ).toLocaleString()}
                  </span>
                </div>

                {/* Cuarta línea: Observaciones del pago */}
                <FormField
                  control={form.control}
                  name="abono.observacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones del Pago</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observaciones del pago..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Botones de acción */}
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-muted-foreground">
                ESC para cancelar
              </span>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {initialData ? "Actualizar Trabajo" : "Registrar Trabajo"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
