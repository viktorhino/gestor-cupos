import { useState, useEffect } from "react";
import { clientService } from "@/lib/services/clients";
import { Client } from "@/lib/types/database";

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getClients();
      setClients(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar clientes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const refreshClients = async () => {
    await loadClients();
  };

  const createClient = async (
    clientData: Omit<Client, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const newClient = await clientService.createClient(clientData);
      if (newClient) {
        setClients((prev) => [...prev, newClient]);
        return newClient;
      }
      return null;
    } catch (err) {
      setError("Error al crear cliente");
      console.error(err);
      return null;
    }
  };

  return { clients, loading, error, refreshClients, createClient };
}
