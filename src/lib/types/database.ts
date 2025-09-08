// Database types for T&V Cupos Management System
// These types correspond to the database schema

export type JobStatus =
  | "recibido"
  | "procesando"
  | "finalizado"
  | "montado"
  | "delegado"
  | "impreso"
  | "empacado"
  | "entregado";

export type JobType = "tarjetas" | "volantes";

export type CardGroup = "brillo" | "mate_reserva";

export type FlyerSize = "media" | "cuarto" | "mini";

export type FlyerMode = "4x0" | "4x1" | "4x4";

export type SpecialFinishType =
  | "perforacion"
  | "despuntadas"
  | "estampado"
  | "repujado"
  | "troquelado";

export type PaymentMethod = "efectivo" | "transferencia" | "cheque" | "tarjeta";

export type UserRole = "admin" | "operario" | "entregas" | "comercial";

// Base database types
export interface Client {
  id: string;
  empresa: string;
  encargado?: string;
  tratamiento?: string;
  nit?: string;
  whatsapp: string;
  email?: string;
  direccion?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface PriceList {
  id: string;
  nombre: string;
  vigente_desde: string;
  vigente_hasta?: string;
  created_at: string;
}

export interface CardReference {
  id: string;
  nombre: string;
  grupo: CardGroup;
  precio_base_por_millar: number;
  price_list_id: string;
  created_at: string;
}

export interface CardSpecialFinish {
  id: string;
  nombre: SpecialFinishType;
  precio_unit_por_millar: number;
  metadata?: Record<string, any>;
  price_list_id: string;
  created_at: string;
}

export interface FlyerType {
  id: string;
  tamaño: FlyerSize;
  modo: FlyerMode;
  precio_base_por_millar: number;
  price_list_id: string;
  created_at: string;
}

export interface Job {
  id: string;
  consecutivo: number;
  client_id: string;
  tipo: JobType;
  nombre_trabajo?: string;
  estado: JobStatus;
  fecha_recepcion: string;
  notas?: string;
  total_estimado: number;
  descuento: number;
  saldo: number;
  created_by?: string;
  imagen_url?: string;
  abono?: {
    monto: number;
    metodo: PaymentMethod;
    observacion?: string;
  };
  // Campos consolidados de job_items
  card_reference_id?: string;
  flyer_type_id?: string;
  ocupacion_cupo: number;
  cantidad_millares: number;
  es_1x2?: boolean;
  terminaciones_especiales?: SpecialFinishConfig[];
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface JobItem {
  id: string;
  job_id: string;
  // For cards
  card_reference_id?: string;
  terminaciones_especiales?: SpecialFinishConfig[];
  // For flyers
  flyer_type_id?: string;
  // Common fields
  ocupacion_cupo: number;
  cantidad_millares: number;
  observaciones?: string;
  imagen_url?: string;
  totales_calculados?: CalculatedTotals;
  estado: JobStatus;
  tercerizado: boolean;
  proveedor_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  job_id: string;
  monto: number;
  metodo: PaymentMethod;
  fecha: string;
  observacion?: string;
  imagen_url?: string;
  created_by?: string;
  created_at: string;
}

export interface Delivery {
  id: string;
  job_id: string;
  fecha: string;
  entregado_a?: string;
  documento?: string;
  saldo_al_momento: number;
  receptor?: string;
  firma_url?: string;
  comprobante_pdf_url?: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  nombre: string;
  contacto?: string;
  whatsapp?: string;
  email?: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierService {
  id: string;
  supplier_id: string;
  servicio: string;
  precio_base: number;
  unidad: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Batch {
  id: string;
  tipo: JobType;
  fecha: string;
  capacidad_teorica?: number;
  grupo?: string;
  costos_resumen?: Record<string, any>;
  estado: "planificado" | "en_produccion" | "cerrado";
  created_at: string;
  updated_at: string;
}

export interface BatchItem {
  id: string;
  batch_id: string;
  job_item_id: string;
  piezas_ocupadas: number;
  notas?: string;
  created_at: string;
}

export interface Costing {
  id: string;
  batch_id: string;
  papel: number;
  planchas: number;
  impresion: number;
  terminacion_basica: number;
  terminacion_especial: number;
  refilado: number;
  otros: number;
  total_costo: number;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  entidad: string;
  entidad_id: string;
  accion: string;
  before_data?: Record<string, any>;
  after_data?: Record<string, any>;
  user_id?: string;
  timestamp: string;
}

// Special finish configuration types
export interface PerforationConfig {
  tipo: "circular" | "lineal";
  posicion: {
    lugar: "centro" | "lado";
    ubicacion: "arriba" | "abajo";
  };
}

export interface CutCornersConfig {
  lados: number;
}

export interface EmbossingConfig {
  color: "dorado" | "plata" | "otro";
  estilo?: string;
}

export interface SpecialFinishConfig {
  tipo: SpecialFinishType;
  precio: number;
  parametros?: PerforationConfig | CutCornersConfig | EmbossingConfig;
}

export interface CalculatedTotals {
  precio_base: number;
  terminaciones: number;
  subtotal: number;
  total: number;
  desglose: {
    referencia: string;
    cantidad: number;
    ocupacion: number;
    precio_unitario: number;
    terminaciones: number;
    subtotal: number;
  }[];
}

// Extended types with relations
export interface JobWithDetails extends Job {
  client: Client;
  card_reference?: CardReference;
  flyer_type?: FlyerType;
  payments: Payment[];
  deliveries: Delivery[];
}

export interface JobItemWithDetails extends JobItem {
  card_reference?: CardReference;
  flyer_type?: FlyerType;
  batch_items?: BatchItem[];
}

export interface BatchWithDetails extends Batch {
  items: (BatchItem & {
    job_item: JobItemWithDetails;
  })[];
  costing?: Costing;
}

export interface ClientWithJobs extends Client {
  jobs: Job[];
  total_pendiente: number;
}

// Form types
export interface JobFormData {
  client_id: string;
  nombre_trabajo: string;
  tipo: JobType;
  // Campos consolidados (antes en job_items)
  card_reference_id?: string;
  flyer_type_id?: string;
  ocupacion_cupo: number;
  cantidad_millares: number;
  es_1x2?: boolean;
  terminaciones_especiales?: SpecialFinishConfig[];
  observaciones?: string;
  imagen_url?: string;
  notas?: string;
  descuento?: number;
  abono?: {
    monto: number;
    metodo: PaymentMethod;
    observacion?: string;
  };
}

export interface BatchFormData {
  tipo: JobType;
  fecha: string;
  items: string[]; // job_item_ids
  notas?: string;
}

export interface CostingFormData {
  batch_id: string;
  papel: number;
  planchas: number;
  impresion: number;
  terminacion_basica: number;
  terminacion_especial: number;
  refilado: number;
  otros: number;
  notas?: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Filter and search types
export interface JobFilters {
  client_id?: string;
  tipo?: JobType;
  estado?: JobStatus;
  fecha_desde?: string;
  fecha_hasta?: string;
  consecutivo?: number;
}

export interface BatchFilters {
  tipo?: JobType;
  fecha?: string;
  estado?: string;
  grupo?: string;
}

// Dashboard data types
export interface DashboardStats {
  tarjetas: {
    brillo: {
      pendientes_montar: number;
      en_cupo: number;
      listas_entrega: number;
    };
    mate_reserva: {
      pendientes_montar: number;
      en_cupo: number;
      listas_entrega: number;
    };
  };
  volantes: {
    media: number;
    cuarto: number;
    mini: number;
  };
  pendientes_entrega: number;
  cupos_hoy: number;
}

// Print types
export interface PrintData {
  tipo: "orden_produccion" | "comprobante_entrega";
  job: JobWithDetails;
  fecha_impresion: string;
  impresora?: string;
}

// WhatsApp Messages System
export interface WhatsAppMessage {
  id: string;
  job_id: string;
  estado_trigger: string;
  template_name: string;
  message_content: string;
  sent_at: string;
  sent_by?: string;
  is_copied: boolean;
  copied_at?: string;
  created_at: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  estado_trigger: string;
  template_content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Extended types with WhatsApp messages
export interface JobWithWhatsApp extends JobWithDetails {
  whatsapp_messages: WhatsAppMessage[];
}
