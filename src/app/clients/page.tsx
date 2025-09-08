"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { ClientList } from "@/components/clients/client-list";
import { useClients } from "@/lib/hooks/use-clients";
import { useState } from "react";
import { ClientForm } from "@/components/forms/client-form";
import {
  Client,
  CreateClientInput,
  UpdateClientInput,
} from "@/lib/types/client";
import { clientService } from "@/lib/services/clients";
import { toast } from "sonner";

export default function ClientsPage() {
  const { clients, loading, refreshClients } = useClients();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [formLoading, setFormLoading] = useState(false);

  const handleCreateClient = async (data: CreateClientInput) => {
    setFormLoading(true);
    try {
      const newClient = await clientService.createClient(data);
      if (newClient) {
        await refreshClients();
        toast.success("Cliente creado exitosamente");
        setIsFormOpen(false);
      } else {
        toast.error("Error al crear el cliente");
      }
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error("Error al crear el cliente");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClient = async (data: UpdateClientInput) => {
    setFormLoading(true);
    try {
      const updatedClient = await clientService.updateClient(data.id, data);
      if (updatedClient) {
        await refreshClients();
        toast.success("Cliente actualizado exitosamente");
        setIsFormOpen(false);
        setEditingClient(undefined);
      } else {
        toast.error("Error al actualizar el cliente");
      }
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Error al actualizar el cliente");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClient = async (client: Client) => {
    if (
      confirm(
        `¿Está seguro de que desea eliminar el cliente "${client.empresa}"?`
      )
    ) {
      try {
        const success = await clientService.deleteClient(client.id);
        if (success) {
          await refreshClients();
          toast.success("Cliente eliminado exitosamente");
        } else {
          toast.error("Error al eliminar el cliente");
        }
      } catch (error) {
        console.error("Error deleting client:", error);
        toast.error("Error al eliminar el cliente");
      }
    }
  };

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleCreateClick = () => {
    setEditingClient(undefined);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingClient(undefined);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona la información de tus clientes
          </p>
        </div>

        <ClientList
          clients={clients}
          loading={loading}
          onCreateClient={handleCreateClick}
          onEditClient={handleEditClick}
          onDeleteClient={handleDeleteClient}
        />

        <ClientForm
          client={editingClient}
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSubmit={editingClient ? handleEditClient : handleCreateClient}
          loading={formLoading}
        />
      </div>
    </MainLayout>
  );
}
