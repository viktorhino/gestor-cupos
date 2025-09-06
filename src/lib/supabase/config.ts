// Supabase configuration
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
};

// Database schema constants
export const TABLES = {
  CLIENTS: "clients",
  PRICE_LISTS: "price_lists",
  CARD_REFERENCES: "card_references",
  CARD_SPECIAL_FINISHES: "card_special_finishes",
  FLYER_TYPES: "flyer_types",
  JOBS: "jobs",
  JOB_ITEMS: "job_items",
  PAYMENTS: "payments",
  DELIVERIES: "deliveries",
  SUPPLIERS: "suppliers",
  SUPPLIER_SERVICES: "supplier_services",
  BATCHES: "batches",
  BATCH_ITEMS: "batch_items",
  COSTING: "costing",
  USERS: "users",
  AUDIT_LOGS: "audit_logs",
} as const;

// Job statuses
export const JOB_STATUS = {
  RECEIVED: "recibido",
  PREPRESS: "en_preprensa",
  PENDING_MOUNT: "pendiente_de_montaje",
  IN_BATCH: "en_cupo",
  PRINTED: "impreso",
  FINISHED: "terminado",
  READY_FOR_DELIVERY: "listo_para_entrega",
  DELIVERED: "entregado",
} as const;

// Job types
export const JOB_TYPES = {
  CARDS: "tarjetas",
  FLYERS: "volantes",
} as const;

// Card groups
export const CARD_GROUPS = {
  BRIGHT: "brillo",
  MATE_RESERVE: "mate_reserva",
} as const;

// Card references
export const CARD_REFERENCES = {
  BRIGHT_UV: "brillo_uv",
  MATE_2L: "mate_2l",
  RESERVE_1L: "reserva_1l",
  RESERVE_2L: "reserva_2l",
} as const;

// Flyer sizes
export const FLYER_SIZES = {
  MEDIA: "media",
  QUARTER: "cuarto",
  MINI: "mini",
} as const;

// Flyer modes
export const FLYER_MODES = {
  "4X0": "4x0",
  "4X1": "4x1",
  "4X4": "4x4",
} as const;

// Special finishes
export const SPECIAL_FINISHES = {
  PERFORATION: "perforacion",
  CUT_CORNERS: "despuntadas",
  EMBOSSING: "estampado",
  DEBOSSING: "repujado",
  DIE_CUTTING: "troquelado",
} as const;

// Payment methods
export const PAYMENT_METHODS = {
  CASH: "efectivo",
  TRANSFER: "transferencia",
  CHECK: "cheque",
  CARD: "tarjeta",
} as const;

// User roles
export const USER_ROLES = {
  ADMIN: "admin",
  OPERATOR: "operario",
  DELIVERY: "entregas",
  COMMERCIAL: "comercial",
} as const;



