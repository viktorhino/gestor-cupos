import { createClient } from "@/lib/supabase/browser";
import { Client } from "@/lib/types/database";

export class ClientService {
  private supabase = createClient();

  async getClients(): Promise<Client[]> {
    const { data, error } = await this.supabase
      .from("clients")
      .select("*")
      .order("empresa");

    if (error) {
      return [];
    }

    return data || [];
  }

  async getClient(id: string): Promise<Client | null> {
    const { data, error } = await this.supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  async createClient(
    client: Omit<Client, "id" | "created_at" | "updated_at">
  ): Promise<Client | null> {
    // Limpiar campos undefined para evitar problemas con Supabase
    const cleanClient = {
      empresa: client.empresa,
      whatsapp: client.whatsapp,
      ...(client.encargado && { encargado: client.encargado }),
      ...(client.tratamiento && { tratamiento: client.tratamiento }),
      ...(client.nit && { nit: client.nit }),
      ...(client.email && { email: client.email }),
      ...(client.direccion && { direccion: client.direccion }),
      ...(client.notas && { notas: client.notas }),
    };

    const { data, error } = await this.supabase
      .from("clients")
      .insert([cleanClient])
      .select()
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  async updateClient(
    id: string,
    updates: Partial<Client>
  ): Promise<Client | null> {
    const { data, error } = await this.supabase
      .from("clients")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  async deleteClient(id: string): Promise<boolean> {
    const { error } = await this.supabase.from("clients").delete().eq("id", id);

    if (error) {
      return false;
    }

    return true;
  }
}

export const clientService = new ClientService();
