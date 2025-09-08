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
import { ImageUploadCompact } from "@/components/ui/image-upload-compact";
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
import { JobWithDetails } from "@/lib/types/database";

// Schema simplificado - solo datos de producción
const jobFormSchema = z.object({
  client_id: z.string().min(1, "Debe seleccionar un cliente"),
  nombre_trabajo: z.string().min(1, "Debe ingresar el nombre del trabajo"),
  tipo: z.enum(["tarjetas", "volantes"]),
  card_reference_id: z.string().optional(),
  flyer_type_id: z.string().optional().or(z.literal("")),
  ocupacion_cupo: z.number().min(1),
  cantidad_millares: z.number().min(1),
  es_1x2: z.boolean().default(false),
  terminaciones_especiales: z.array(z.any()).default([]),
  observaciones: z.string().optional(),
  imagen_url: z.string().optional(),
  notas: z.string().optional(),
  descuento: z.number().min(0).optional(),
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
  const [selectedClientIndex, setSelectedClientIndex] = useState(-1);
  const [cardReferences, setCardReferences] = useState<any[]>([]);
  const [flyerTypes, setFlyerTypes] = useState<any[]>([]);
  const [specialFinishes, setSpecialFinishes] = useState<SpecialFinish[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClientDialog, setNewClientDialog] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEncargado, setNewClientEncargado] = useState("");
  const [newClientTratamiento, setNewClientTratamiento] = useState("");
  const [newClientWhatsapp, setNewClientWhatsapp] = useState("");
  const [newClientObservaciones, setNewClientObservaciones] = useState("");

  const {
    clients,
    loading: clientsLoading,
    refreshClients,
    createClient,
  } = useClients();

  // Filtrar clientes
  const filteredClients = clients.filter((client) =>
    client.empresa.toLowerCase().includes(clientSearchValue.toLowerCase())
  );

  // Manejar teclado en el select de cliente
  const handleClientKeyDown = (e: React.KeyboardEvent) => {
    if (!clientComboOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedClientIndex((prev) =>
          prev < filteredClients.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedClientIndex((prev) =>
          prev > 0 ? prev - 1 : filteredClients.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (
          selectedClientIndex >= 0 &&
          selectedClientIndex < filteredClients.length
        ) {
          const client = filteredClients[selectedClientIndex];
          selectClient(client);
        }
        break;
      case "Escape":
        e.preventDefault();
        setClientComboOpen(false);
        setSelectedClientIndex(-1);
        break;
    }
  };

  // Seleccionar cliente
  const selectClient = (client: any) => {
    console.log("Selecting client:", client.empresa, "ID:", client.id);
    form.setValue("client_id", client.id);
    setSelectedClient(client.empresa);
    setClientComboOpen(false);
    setClientSearchValue("");
    setSelectedClientIndex(-1);
  };

  // Manejar creación de nuevo cliente
  const handleNewClient = () => {
    setClientComboOpen(false);
    setNewClientDialog(true);
  };

  // Manejar cliente creado exitosamente
  const handleClientCreated = async (newClient: any) => {
    console.log("New client created:", newClient);
    await refreshClients();
    selectClient(newClient);
    setNewClientDialog(false);
  };

  // Crear nuevo cliente
  const addNewClient = async () => {
    if (newClientName && newClientWhatsapp) {
      try {
        const clientData = {
          empresa: newClientName,
          encargado: newClientEncargado || undefined,
          tratamiento: newClientTratamiento || undefined,
          whatsapp: newClientWhatsapp,
          notas: newClientObservaciones || undefined,
        };

        console.log("Creating client with data:", clientData);

        const newClient = await createClient(clientData);

        if (newClient) {
          form.setValue("client_id", newClient.id);
          setSelectedClient(newClient.empresa);
          setNewClientName("");
          setNewClientEncargado("");
          setNewClientTratamiento("");
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
    }
  };

  const form = useForm({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      client_id: "",
      nombre_trabajo: "",
      tipo: "tarjetas",
      ocupacion_cupo: 1,
      cantidad_millares: 1,
      es_1x2: false,
      terminaciones_especiales: [],
      observaciones: "",
      imagen_url: "",
      notas: "",
      descuento: 0,
    },
  });

  // Precargar datos del trabajo existente
  useEffect(() => {
    if (initialData) {
      console.log("Precargando datos del trabajo:", initialData);

      // Precargar datos básicos
      form.setValue("client_id", initialData.client_id);
      form.setValue("nombre_trabajo", initialData.nombre_trabajo || "");
      form.setValue("tipo", initialData.tipo);
      form.setValue("ocupacion_cupo", initialData.ocupacion_cupo || 1);
      form.setValue("cantidad_millares", initialData.cantidad_millares || 1);
      form.setValue("es_1x2", initialData.es_1x2 || false);
      form.setValue("observaciones", initialData.observaciones || "");
      form.setValue("imagen_url", initialData.imagen_url || "");
      form.setValue("notas", initialData.notas || "");
      form.setValue("descuento", initialData.descuento || 0);

      // Precargar terminaciones especiales
      if (initialData.terminaciones_especiales) {
        form.setValue(
          "terminaciones_especiales",
          initialData.terminaciones_especiales
        );
      }

      // Precargar referencia de tarjeta o tipo de volante
      if (initialData.tipo === "tarjetas" && initialData.card_reference_id) {
        form.setValue("card_reference_id", initialData.card_reference_id);
      } else if (initialData.tipo === "volantes" && initialData.flyer_type_id) {
        form.setValue("flyer_type_id", initialData.flyer_type_id);
      }

      // Precargar datos del cliente
      if (initialData.client) {
        setSelectedClient(initialData.client.empresa);
      }

      console.log("Datos precargados exitosamente");
    }
  }, [initialData, form]);

  const watchJobType = form.watch("tipo");
  const watchCupos = form.watch("ocupacion_cupo");
  const watchMillares = form.watch("cantidad_millares");

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Loading form data...");
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

  // Calcular totales - solo valor del trabajo
  const calculateTotals = useCallback(() => {
    // Obtener valores directamente del formulario para evitar retrasos
    const formValues = form.getValues();
    const cupos = formValues.ocupacion_cupo || 1;
    const millares = formValues.cantidad_millares || 1;
    const es_1x2 = formValues.es_1x2 || false;
    const terminaciones = formValues.terminaciones_especiales || [];
    const descuento = formValues.descuento || 0;
    const jobType = formValues.tipo;

    let total = 0;

    if (jobType === "tarjetas") {
      const cardRefId = formValues.card_reference_id;
      const cardRef = cardReferences.find((ref) => ref.id === cardRefId);
      if (cardRef) {
        // Precio base = precio_por_millar × (millares / 2 si es 1x2) × cupos
        const millaresParaPrecio = es_1x2 ? millares / 2 : millares;
        total = cardRef.precio_base_por_millar * millaresParaPrecio * cupos;
      }
    } else if (jobType === "volantes") {
      const flyerTypeId = formValues.flyer_type_id;
      const flyerType = flyerTypes.find((type) => type.id === flyerTypeId);
      if (flyerType) {
        // Precio base = precio_por_millar × (millares / 2 si es 1x2) × cupos
        const millaresParaPrecio = es_1x2 ? millares / 2 : millares;
        total = flyerType.precio_base_por_millar * millaresParaPrecio * cupos;
      }
    }

    // Agregar terminaciones especiales
    terminaciones.forEach((terminacion: any) => {
      const specialFinish = specialFinishes.find(
        (sf) => sf.id === terminacion.tipo
      );
      if (specialFinish) {
        // Terminaciones especiales = precio_por_millar × millares (SIN cupos, SIN 1x2)
        const precioTerminacion =
          specialFinish.precio_unit_por_millar * millares;
        total += precioTerminacion;
      }
    });

    const totalConDescuento = total - descuento;

    setTotalCalculated(totalConDescuento);
  }, [cardReferences, flyerTypes, specialFinishes, form]);

  // Escuchar cambios en los campos del formulario
  const watchedFields = form.watch([
    "tipo",
    "card_reference_id",
    "flyer_type_id",
    "ocupacion_cupo",
    "cantidad_millares",
    "es_1x2",
    "terminaciones_especiales",
    "descuento",
  ]);

  useEffect(() => {
    calculateTotals();
  }, [watchedFields, calculateTotals]);

  const onSubmit = async (data: any) => {
    try {
      console.log("Submitting job form:", data);

      if (initialData) {
        // Editar trabajo existente
        const updatedJob = await jobService.updateJob(initialData.id, data);
        if (!updatedJob) {
          toast.error("Error al actualizar el trabajo");
          return;
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-100">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Trabajo" : "Agregar Trabajo"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            setSelectedClientIndex(-1);
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
                          <div className="p-2">
                            <Input
                              placeholder="Buscar cliente..."
                              value={clientSearchValue}
                              onChange={(e) => {
                                setClientSearchValue(e.target.value);
                                setSelectedClientIndex(-1); // Reset selection when typing
                              }}
                              onKeyDown={handleClientKeyDown}
                              className="mb-2"
                              autoFocus
                            />
                            <div className="max-h-60 overflow-y-auto">
                              {filteredClients.map((client, index) => (
                                <div
                                  key={client.id}
                                  className={`flex items-center px-3 py-2 cursor-pointer rounded-md ${
                                    index === selectedClientIndex
                                      ? "bg-blue-100 text-blue-900"
                                      : "hover:bg-gray-100"
                                  }`}
                                  onClick={() => selectClient(client)}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      field.value === client.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    }`}
                                  />
                                  <span className="text-sm">
                                    {client.empresa}
                                  </span>
                                </div>
                              ))}
                              {filteredClients.length === 0 && (
                                <div className="flex items-center justify-center py-4">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleNewClient}
                                    className="flex items-center gap-2"
                                  >
                                    <UserPlus className="h-4 w-4" />
                                    Agregar Cliente
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
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
                              {flyerTypes.length === 0 ? (
                                <SelectItem value="" disabled>
                                  {loading
                                    ? "Cargando tipos de volantes..."
                                    : "No hay tipos de volantes disponibles"}
                                </SelectItem>
                              ) : (
                                flyerTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.tamaño} - {type.modo}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Segunda línea: Cupos, Millares y 1x2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  <FormField
                    control={form.control}
                    name="es_1x2"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 pt-8">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              setTimeout(() => calculateTotals(), 100);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">1x2</FormLabel>
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

                {/* Quinta línea: Subida de imagen */}
                {!initialData && (
                  <FormField
                    control={form.control}
                    name="imagen_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imagen del trabajo</FormLabel>
                        <FormControl>
                          <ImageUploadCompact
                            value={field.value}
                            onChange={field.onChange}
                            jobId={(initialData as any)?.id}
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
                  <span className="text-2xl font-bold text-green-600">
                    ${totalCalculated.toLocaleString()}
                  </span>
                </div>

                {/* Segunda línea: Descuento */}
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
                </div>

                {/* Nota informativa */}
                <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
                  💡 Para gestionar pagos y abonos, utiliza el módulo de
                  "Gestión de Pagos" en el menú principal.
                </div>
              </CardContent>
            </Card>

            {/* Botones de acción */}
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-muted-foreground">
                ESC para cancelar
              </span>
              <div className="flex gap-2">
                <Button type="button" variant="outline">
                  Imprimir OdeW
                </Button>
                <Button type="submit">
                  {initialData ? "Actualizar Trabajo" : "Registrar Trabajo"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>

      {/* Modal para agregar nuevo cliente */}
      <Dialog open={newClientDialog} onOpenChange={setNewClientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="client-name">Nombre de la Empresa *</Label>
              <Input
                id="client-name"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Ej: Empresa ABC"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client-encargado">Encargado</Label>
                <Input
                  id="client-encargado"
                  value={newClientEncargado}
                  onChange={(e) => setNewClientEncargado(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-tratamiento">Tratamiento</Label>
                <Input
                  id="client-tratamiento"
                  value={newClientTratamiento}
                  onChange={(e) => setNewClientTratamiento(e.target.value)}
                  placeholder="Ej: Don Juan, Juan"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-whatsapp">WhatsApp *</Label>
              <Input
                id="client-whatsapp"
                value={newClientWhatsapp}
                onChange={(e) => setNewClientWhatsapp(e.target.value)}
                placeholder="Ej: 3001234567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-observaciones">Observaciones</Label>
              <Textarea
                id="client-observaciones"
                value={newClientObservaciones}
                onChange={(e) => setNewClientObservaciones(e.target.value)}
                placeholder="Observaciones adicionales..."
                className="min-h-[80px]"
              />
            </div>
          </div>
          <div className="flex justify-between items-center pt-4">
            <p className="text-xs text-muted-foreground">ESC para cancelar</p>
            <Button
              type="button"
              onClick={addNewClient}
              disabled={!newClientName || !newClientWhatsapp}
            >
              Agregar Cliente
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
