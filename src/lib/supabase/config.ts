export type CardGroup = "brillo" | "mate_reserva";

export const CARD_GROUPS: CardGroup[] = ["brillo", "mate_reserva"];

export const CARD_REFERENCES = [
  "brillo_uv",
  "mate_2l",
  "reserva_1l",
  "reserva_2l",
];

export const SPECIAL_FINISHES = [
  "perforacion",
  "despuntadas",
  "estampado",
  "repujado",
  "troquelado",
];

export const FLYER_SIZES = ["media_carta", "cuarto_carta", "mini_volante"];

export const FLYER_MODES = ["4x0", "4x1", "4x4"];

export const TABLES = {
  CARD_SPECIAL_FINISHES: "card_special_finishes",
  CARD_REFERENCES: "card_references",
  FLYER_TYPES: "flyer_types",
  JOBS: "jobs",
  CLIENTS: "clients",
  PAYMENTS: "payments",
  WHATSAPP_MESSAGES: "whatsapp_messages",
  MESSAGE_TEMPLATES: "message_templates",
};

// Configuración simplificada de Supabase
export const supabaseConfig = {
  url: "https://dabffkglfwdjfaanzpkm.supabase.co",
  anonKey: "REEMPLAZA_CON_TU_CLAVE_REAL_AQUI",
};
