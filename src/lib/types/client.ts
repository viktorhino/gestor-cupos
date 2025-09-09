export interface Client {
  id: string;
  nombre: string;
  encargado?: string;
  nit?: string;
  whatsapp: string;
  email?: string;
  foto?: string;
  direccion?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientInput {
  nombre: string;
  encargado?: string;
  nit?: string;
  whatsapp: string;
  email?: string;
  foto?: string;
  direccion?: string;
  notas?: string;
}

export interface UpdateClientInput extends Partial<CreateClientInput> {
  id: string;
}
