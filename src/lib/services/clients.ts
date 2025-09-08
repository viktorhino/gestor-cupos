import { createClient } from "@/lib/supabase/browser";
import { Client } from "@/lib/types/database";

export class ClientService {
  private supabase = createClient();

  async getClients(): Promise<Client[]> {
    const { data, error } = await this.supabase
      .from("clients")
      .select("*")
      .order("empresa, nombre"); // Ordenar por empresa, con fallback a nombre

    if (error) {
      console.error("Error fetching clients:", error);
      return [];
    }

    // Mapear los datos para asegurar que 'empresa' esté disponible
    const mappedData = (data || []).map(client => ({
      ...client,
      empresa: client.empresa || client.nombre, // Usar empresa si existe, sino nombre
    }));

    return mappedData;
  }

  async getClient(id: string): Promise<Client | null> {
    const { data, error } = await this.supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching client:", error);
      return null;
    }

    // Mapear los datos para asegurar que 'empresa' esté disponible
    return {
      ...data,
      empresa: data.empresa || data.nombre, // Usar empresa si existe, sino nombre
    };
  }

  async createClient(
    client: Omit<Client, "id" | "created_at" | "updated_at">
  ): Promise<Client | null> {
    // Limpiar campos undefined para evitar problemas con Supabase
    // Temporalmente enviar datos a ambas columnas hasta que se complete la migración
    const cleanClient = {
      nombre: client.empresa, // Mantener compatibilidad con columna 'nombre'
      empresa: client.empresa, // Nueva columna 'empresa'
      whatsapp: client.whatsapp,
      ...(client.encargado && { encargado: client.encargado }),
      ...(client.tratamiento && { tratamiento: client.tratamiento }),
      ...(client.nit && { nit: client.nit }),
      ...(client.email && { email: client.email }),
      ...(client.direccion && { direccion: client.direccion }),
      ...(client.notas && { notas: client.notas }),
    };

    console.log("Clean client data:", cleanClient);

    const { data, error } = await this.supabase
      .from("clients")
      .insert([cleanClient])
      .select()
      .single();

    if (error) {
      console.error("Error creating client:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      console.error(
        "Client data being inserted:",
        JSON.stringify(cleanClient, null, 2)
      );
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
      console.error("Error updating client:", error);
      return null;
    }

    return data;
  }

  async deleteClient(id: string): Promise<boolean> {
    const { error } = await this.supabase.from("clients").delete().eq("id", id);

    if (error) {
      console.error("Error deleting client:", error);
      return false;
    }

    return true;
  }
}

export const clientService = new ClientService();
