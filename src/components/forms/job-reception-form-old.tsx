"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Plus,
  Trash2,
  Upload,
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
import { jobService } from "@/lib/services/jobs";
import { paymentService } from "@/lib/services/payments";
import {
  Client,
  CardReference,
  FlyerType,
  JobWithDetails,
} from "@/lib/types/database";

// Schema de validación
const specialFinishSchema = z.object({
  tipo: z.string(), // ID de la terminación especial
  parametros: z.any().optional(),
});

const jobItemSchema = z
  .object({
    // Para tarjetas
    card_reference_id: z.string().optional(),
    terminaciones_especiales: z.array(specialFinishSchema).optional(),
    // Para volantes
    flyer_type_id: z.string().optional(),
    // Campos comunes
    ocupacion_cupo: z.number().min(1),
    cantidad_millares: z.number().min(1),
    observaciones: z.string().optional(),
    imagen_url: z.string().optional(),
  })
  .refine(
    (data) =>
      (data.card_reference_id && !data.flyer_type_id) ||
      (!data.card_reference_id && data.flyer_type_id),
    {
      message:
        "Debe seleccionar una referencia de tarjeta o un tipo de volante",
      path: ["card_reference_id"],
    }
  );

const jobFormSchema = z.object({
  client_id: z.string().min(1, "Debe seleccionar un cliente"),
  nombre_trabajo: z.string().min(1, "Debe ingresar el nombre del trabajo"),
  tipo: z.enum(["tarjetas", "volantes"]),
  item: jobItemSchema,
  notas: z.string().optional(),
  imagen_url: z.string().optional(),
  descuento: z.number().min(0, "El descuento no puede ser negativo").optional(),
  abono: z
    .object({
      monto: z.number().min(0),
      metodo: z.enum(["efectivo", "transferencia", "cheque", "tarjeta"]),
      observacion: z.string().optional(),
    })
    .optional(),
});

type JobFormData = z.infer<typeof jobFormSchema>;

// Datos reales desde la base de datos

// Función para formatear números de manera consistente
const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

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
  const [cardReferences, setCardReferences] = useState<CardReference[]>([]);
  const [flyerTypes, setFlyerTypes] = useState<FlyerType[]>([]);
  const [specialFinishes, setSpecialFinishes] = useState<SpecialFinish[]>([]);
  const [loading, setLoading] = useState(true);

  // Hooks para datos reales
  const { clients, createClient } = useClients();

  // Cargar datos de referencias y tipos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const cardRefs = await cardReferenceService.getCardReferences();
        const flyerTypesData = await flyerTypeService.getFlyerTypes();
        const specialFinishesData =
          await specialFinishService.getSpecialFinishes();

        setCardReferences(cardRefs);
        setFlyerTypes(flyerTypesData);
        setSpecialFinishes(specialFinishesData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Error al cargar datos de referencias");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      client_id: "",
      nombre_trabajo: "",
      tipo: "tarjetas",
      item: {
        ocupacion_cupo: 1,
        cantidad_millares: 1,
        card_reference_id: "",
        flyer_type_id: "",
        terminaciones_especiales: [],
        observaciones: "",
      },
      notas: "",
      descuento: 0,
      imagen_url: "",
      abono: {
        monto: 0,
        metodo: "efectivo",
        observacion: "",
      },
    },
  });

  // Pre-llenar formulario cuando hay initialData (modo edición)
  useEffect(() => {
    if (initialData && cardReferences.length > 0 && flyerTypes.length > 0) {
      const firstItem = initialData.job_items?.[0];
      if (firstItem) {
        console.log("Pre-llenando formulario con initialData:", initialData);
        console.log("Tipo de trabajo:", initialData.tipo);

        const formData = {
          client_id: initialData.client_id ?? "",
          nombre_trabajo: initialData.nombre_trabajo ?? "",
          tipo: initialData.tipo as "tarjetas" | "volantes",
          item: {
            ocupacion_cupo: firstItem.ocupacion_cupo ?? 1,
            cantidad_millares: firstItem.cantidad_millares ?? 1,
            card_reference_id: firstItem.card_reference_id ?? "",
            flyer_type_id: firstItem.flyer_type_id ?? "",
            terminaciones_especiales: firstItem.terminaciones_especiales ?? [],
            observaciones: firstItem.observaciones ?? "",
          },
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
          imagen_url: initialData.imagen_url ?? "",
        };

        console.log("Datos del formulario a resetear:", formData);
        form.reset(formData);

        // Establecer cliente seleccionado
        setSelectedClient(initialData.client_id || "");

        // Establecer tipo de trabajo
        setJobType(initialData.tipo as "tarjetas" | "volantes");

        // Calcular totales después de pre-llenar
        setTimeout(() => {
          calculateTotals();
        }, 200);
      }
    }
  }, [initialData, form, cardReferences, flyerTypes]);

  const watchItem = form.watch("item");
  const watchJobType = form.watch("tipo");

  // Calcular totales
  const calculateTotals = () => {
    let total = 0;

    const item = watchItem;
    if (item) {
      if (item.card_reference_id) {
        const reference = cardReferences.find(
          (r) => r.id === item.card_reference_id
        );
        if (reference) {
          let itemTotal =
            reference.precio_base_por_millar *
            item.ocupacion_cupo *
            item.cantidad_millares;

          // Agregar terminaciones especiales (solo multiplican por millares, no por cupos)
          if (
            item.terminaciones_especiales &&
            item.terminaciones_especiales.length > 0
          ) {
            item.terminaciones_especiales.forEach((finish) => {
              const specialFinish = specialFinishes.find(
                (sf) => sf.id === finish.tipo
              );
              if (specialFinish) {
                const finishCost =
                  specialFinish.precio_unit_por_millar * item.cantidad_millares; // Solo millares, no cupos
                itemTotal += finishCost;
              }
            });
          }

          total += itemTotal;
        }
      } else if (item.flyer_type_id) {
        const flyerType = flyerTypes.find((f) => f.id === item.flyer_type_id);
        if (flyerType) {
          const itemTotal =
            flyerType.precio_base_por_millar *
            item.ocupacion_cupo *
            item.cantidad_millares;
          total += itemTotal;
        }
      }
    }

    // Aplicar descuento si existe
    const descuento = form.watch("descuento") || 0;
    const totalConDescuento = total - descuento;

    setTotalCalculated(totalConDescuento);
  };

  // Recalcular cuando cambie el item
  useEffect(() => {
    calculateTotals();
  }, [watchItem]);

  // Focus automático en el select de cliente al cargar (solo para nuevos trabajos)
  useEffect(() => {
    if (!initialData) {
      const timer = setTimeout(() => {
        const clientSelect = document.querySelector("[data-client-select]");
        if (clientSelect) {
          (clientSelect as HTMLElement).click();
          // Abrir el popover automáticamente
          setClientComboOpen(true);
          // Focus en el input de búsqueda
          setTimeout(() => {
            const input = document.querySelector("[data-client-search]");
            if (input) {
              (input as HTMLElement).focus();
            }
          }, 200);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [initialData]);

  const onSubmit = async (data: JobFormData) => {
    try {
      setLoading(true);
      let jobId: string | null = null;

      if (initialData) {
        // Editar trabajo existente
        const updatedJob = await jobService.updateJob(initialData.id, {
          client_id: data.client_id,
          nombre_trabajo: data.nombre_trabajo,
          notas: data.notas,
          imagen_url: data.imagen_url,
          descuento: data.descuento || 0,
        });

        if (!updatedJob) {
          toast.error("Error al actualizar el trabajo");
          return;
        }

        jobId = updatedJob.id;

        // Actualizar el item del trabajo
        if (initialData.job_items?.[0]?.id) {
          const itemId = initialData.job_items[0].id;
          console.log("Attempting to update job item with ID:", itemId);

          const itemData = {
            ocupacion_cupo: data.item.ocupacion_cupo,
            cantidad_millares: data.item.cantidad_millares,
            card_reference_id: data.item.card_reference_id || null,
            flyer_type_id: data.item.flyer_type_id || null,
            terminaciones_especiales: data.item.terminaciones_especiales || [],
            observaciones: data.item.observaciones || null,
          };

          console.log("Item data to update:", itemData);

          const updatedItem = await (jobService as any).updateJobItem(
            itemId,
            itemData
          );

          if (!updatedItem) {
            console.error("Failed to update job item");
            toast.error("Error al actualizar los detalles del trabajo");
            return;
          }

          console.log("Job item updated successfully");
        } else {
          console.error("No job item ID found for update");
          toast.error("No se encontró el item del trabajo para actualizar");
          return;
        }

        // Si hay abono, crear o actualizar el pago
        if (data.abono && data.abono.monto > 0) {
          // Verificar si ya existe un pago para este trabajo
          const existingPayments = await paymentService.getPaymentsByJobId(
            initialData.id
          );

          if (existingPayments.length > 0) {
            // Actualizar el primer pago existente
            const updatedPayment = await paymentService.updatePayment(
              existingPayments[0].id,
              {
                monto: data.abono.monto,
                metodo: data.abono.metodo,
                observacion: data.abono.observacion,
              }
            );

            if (!updatedPayment) {
              console.error("Error al actualizar el pago");
              toast.error("Error al actualizar el abono");
              return;
            }

            console.log("Abono actualizado:", updatedPayment);
          } else {
            // Crear nuevo pago
            const payment = await paymentService.createPayment({
              job_id: initialData.id,
              monto: data.abono.monto,
              metodo: data.abono.metodo,
              observacion: data.abono.observacion,
            });

            if (!payment) {
              console.error("Error al crear el pago");
              toast.error("Error al registrar el abono");
              return;
            }

            console.log("Abono creado:", payment);
          }
        } else if (data.abono && data.abono.monto === 0) {
          // Si el monto es 0, eliminar pagos existentes
          const existingPayments = await paymentService.getPaymentsByJobId(
            initialData.id
          );
          for (const payment of existingPayments) {
            await paymentService.deletePayment(payment.id);
          }
          console.log("Abonos eliminados");
        }

        toast.success("Trabajo actualizado exitosamente");
      } else {
        // Crear nuevo trabajo
        const job = await jobService.createJob({
          client_id: data.client_id,
          tipo: data.tipo,
          nombre_trabajo: data.nombre_trabajo,
          notas: data.notas,
          imagen_url: "", // Se actualizará después de subir la imagen
          descuento: data.descuento || 0,
        });

        if (!job) {
          toast.error("Error al crear el trabajo");
          return;
        }

        // Si hay una imagen base64 temporal, subirla a Supabase Storage
        console.log(
          "Checking for image to upload - imagen_url:",
          data.imagen_url?.substring(0, 50) + "..."
        );
        if (data.imagen_url && data.imagen_url.startsWith("data:image/")) {
          console.log("Starting image upload process...");
          try {
            // Convertir base64 a File
            const response = await fetch(data.imagen_url);
            const blob = await response.blob();
            const file = new File([blob], "work-image.png", {
              type: "image/png",
            });

            console.log("File created from base64, uploading to storage...");
            // Subir a Supabase Storage
            const imageUrl = await storageService.uploadWorkImage(file, job.id);
            console.log("Storage service returned:", imageUrl);

            if (imageUrl) {
              console.log(
                "Image uploaded successfully, updating job with URL:",
                imageUrl
              );
              // Actualizar el trabajo con la URL de la imagen
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
              console.error("Failed to upload image to storage");
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

        jobId = job.id;

        // Crear el ítem del trabajo
        console.log("Creating job item with data:", data.item);

        // Limpiar los datos antes de enviar - convertir strings vacíos a null
        const cleanedItemData = {
          ...data.item,
          card_reference_id: data.item.card_reference_id || null,
          flyer_type_id: data.item.flyer_type_id || null,
          observaciones: data.item.observaciones || null,
        };

        console.log("Cleaned item data:", cleanedItemData);

        const jobItem = await jobService.createJobItem(job.id, cleanedItemData);
        if (!jobItem) {
          toast.error("Error al crear el ítem del trabajo");
          return;
        }

        // Si hay abono, crear el pago
        if (data.abono && data.abono.monto > 0) {
          const payment = await paymentService.createPayment({
            job_id: job.id,
            monto: data.abono.monto,
            metodo: data.abono.metodo,
            observacion: data.abono.observacion,
          });

          if (!payment) {
            console.error("Error al crear el pago");
            toast.error("Error al registrar el abono");
            return;
          }

          console.log("Abono registrado:", payment);
        }

        toast.success("Trabajo registrado exitosamente");
      }

      // Llamar callback si existe
      if (onJobSaved) {
        if (initialData) {
          // Para edición, usar los datos actualizados
          onJobSaved(initialData);
        } else if (jobId) {
          // Para creación, obtener el trabajo completo con detalles
          const jobWithDetails = await jobService.getJob(jobId);
          if (jobWithDetails) {
            onJobSaved(jobWithDetails);
          }
        }
      } else {
        // Solo resetear si no hay callback (modo standalone)
        if (!initialData) {
          form.reset();
          setSelectedClient("");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al registrar el trabajo");
    } finally {
      setLoading(false);
    }
  };

  const addNewClient = async () => {
    if (newClientName && newClientWhatsapp) {
      try {
        const clientData = {
          nombre: newClientName,
          whatsapp: newClientWhatsapp,
          observaciones: newClientObservaciones || undefined,
        };

        console.log("Creating client with data:", clientData);

        const newClient = await createClient(clientData);

        if (newClient) {
          form.setValue("client_id", newClient.id);
          setSelectedClient(newClient.id);
          setNewClientName("");
          setNewClientWhatsapp("");
          setNewClientObservaciones("");
          setNewClientDialog(false);
          toast.success(`Cliente "${newClientName}" agregado exitosamente`);
        } else {
          toast.error(
            "Error al crear el cliente - no se devolvió ningún cliente"
          );
        }
      } catch (error) {
        console.error("Error creating client:", error);
        toast.error("Error al crear el cliente");
      }
    } else {
      toast.error("Debe ingresar nombre y WhatsApp");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Información del Cliente */}
          <Card className="bg-white">
            <CardContent className="space-y-4 px-6 py-4">
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Cliente *</FormLabel>
                    <div className="flex gap-2">
                      <Popover
                        open={clientComboOpen}
                        onOpenChange={(open) => {
                          setClientComboOpen(open);
                          if (open) {
                            // Focus en el input de búsqueda cuando se abre
                            setTimeout(() => {
                              const input = document.querySelector(
                                "[data-client-search]"
                              );
                              if (input) {
                                (input as HTMLElement).focus();
                              }
                            }, 100);
                          }
                        }}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={clientComboOpen}
                              className="flex-1 justify-between"
                              data-client-select
                              onClick={() => {
                                setClientComboOpen(true);
                                // Focus automático en el input de búsqueda
                                setTimeout(() => {
                                  const input = document.querySelector(
                                    "[data-client-search]"
                                  );
                                  if (input) {
                                    (input as HTMLElement).focus();
                                  }
                                }, 100);
                              }}
                            >
                              {field.value
                                ? clients.find(
                                    (client) => client.id === field.value
                                  )?.nombre
                                : "Buscar cliente..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Escriba para buscar..."
                              data-client-search
                              value={clientSearchValue}
                              onValueChange={setClientSearchValue}
                            />
                            <CommandList>
                              <CommandEmpty>
                                No se encontraron clientes.
                              </CommandEmpty>
                              <CommandGroup>
                                {clients.map((client) => (
                                  <CommandItem
                                    key={client.id}
                                    value={client.nombre}
                                    onSelect={(currentValue) => {
                                      if (currentValue === client.nombre) {
                                        field.onChange(client.id);
                                        setSelectedClient(client.id);
                                        setClientComboOpen(false);
                                        setClientSearchValue("");
                                      }
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        field.value === client.id
                                          ? "opacity-100"
                                          : "opacity-0"
                                      }`}
                                    />
                                    {client.nombre}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <Dialog
                        open={newClientDialog}
                        onOpenChange={setNewClientDialog}
                      >
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" size="icon">
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <Label htmlFor="client-name">
                                Nombre de la Empresa *
                              </Label>
                              <Input
                                id="client-name"
                                value={newClientName}
                                onChange={(e) =>
                                  setNewClientName(e.target.value)
                                }
                                placeholder="Ej: Empresa ABC"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="client-whatsapp">
                                WhatsApp *
                              </Label>
                              <Input
                                id="client-whatsapp"
                                value={newClientWhatsapp}
                                onChange={(e) =>
                                  setNewClientWhatsapp(e.target.value)
                                }
                                placeholder="Ej: 3001234567"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="client-observaciones">
                                Observaciones
                              </Label>
                              <Textarea
                                id="client-observaciones"
                                value={newClientObservaciones}
                                onChange={(e) =>
                                  setNewClientObservaciones(e.target.value)
                                }
                                placeholder="Observaciones adicionales..."
                                className="min-h-[80px]"
                              />
                            </div>
                          </div>
                          <DialogFooter className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">
                              ESC para cancelar
                            </p>
                            <Button
                              type="button"
                              onClick={addNewClient}
                              disabled={!newClientName || !newClientWhatsapp}
                            >
                              Agregar Cliente
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            <CardContent className="space-y-4 px-6 py-4">
              {/* Primera línea: Tipo de trabajo y Terminación/Tamaño */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Trabajo *</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setJobType(value as "tarjetas" | "volantes");
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
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
                    name="item.card_reference_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terminación *</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setTimeout(() => calculateTotals(), 100);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
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
                    name="item.flyer_type_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tamaño y Tintas *</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setTimeout(() => calculateTotals(), 100);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="MediaC, CuartoDeC, etc" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {flyerTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.tamaño} - {type.modo}
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
                  name="item.ocupacion_cupo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cupos *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
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
                  name="item.cantidad_millares"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Millares *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
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
                            watchItem?.terminaciones_especiales?.some(
                              (t) => t.tipo === finish.id
                            ) || false
                          }
                          onCheckedChange={(checked) => {
                            const currentFinishes =
                              watchItem?.terminaciones_especiales || [];
                            let newFinishes;

                            if (checked) {
                              // Agregar terminación
                              newFinishes = [
                                ...currentFinishes,
                                { tipo: finish.id, parametros: {} },
                              ];
                            } else {
                              // Remover terminación
                              newFinishes = currentFinishes.filter(
                                (t) => t.tipo !== finish.id
                              );
                            }

                            form.setValue(
                              "item.terminaciones_especiales",
                              newFinishes
                            );
                            // Calcular inmediatamente después de cambiar terminaciones
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
                name="item.observaciones"
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
                          jobId="temp" // Temporal hasta que se cree el trabajo
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
            <CardContent className="space-y-4 px-6 py-4">
              {/* Primera línea: Valor estimado del trabajo */}
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="text-lg font-medium">
                  Valor Estimado del Trabajo:
                </span>
                <span className="text-2xl font-bold text-primary">
                  ${formatNumber(totalCalculated)}
                </span>
              </div>

              {/* Campo de descuento */}
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

              {/* Segunda línea: Abono y Saldo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span className="text-lg font-medium">Saldo:</span>
                  <span className="text-xl font-semibold text-orange-600">
                    $
                    {formatNumber(
                      totalCalculated - (form.watch("abono.monto") || 0)
                    )}
                  </span>
                </div>
              </div>

              {/* Tercera línea: Observaciones del pago */}
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

          {/* Botones de Acción */}
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">ESC para cancelar</p>
            <div className="flex space-x-4">
              <Button type="button" variant="outline">
                Imprimir OdeW
              </Button>
              <Button type="submit" className="min-w-[120px]">
                {initialData ? "Actualizar Trabajo" : "Registrar Trabajo"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
