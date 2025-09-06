"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientForm } from "@/components/forms/client-form";
import { useClients } from "@/lib/hooks/use-clients";
import {
  Client,
  CreateClientInput,
  UpdateClientInput,
} from "@/lib/types/client";
import { clientService } from "@/lib/services/clients";
import { toast } from "sonner";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Phone,
  Mail,
  User,
  MapPin,
  FileText,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClientsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClientsSidebar({ isOpen, onClose }: ClientsSidebarProps) {
  const { clients, loading, refreshClients } = useClients();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [formLoading, setFormLoading] = useState(false);

  const filteredClients = clients.filter((client) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.nombre.toLowerCase().includes(searchLower) ||
      client.encargado?.toLowerCase().includes(searchLower) ||
      client.whatsapp.includes(searchTerm) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.nit?.includes(searchTerm)
    );
  });

  const getInitials = (nombre: string, encargado?: string) => {
    const firstInitial = nombre?.charAt(0) || "";
    const lastInitial = encargado?.charAt(0) || "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const formatWhatsApp = (whatsapp: string) => {
    return whatsapp.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
        `¿Está seguro de que desea eliminar el cliente "${client.nombre}"?`
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
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-[800px] sm:max-w-[800px]">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle>Clientes</SheetTitle>
                <SheetDescription>
                  Gestiona la información de tus clientes
                </SheetDescription>
              </div>
              <Button onClick={onClose} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* Header con búsqueda y acciones */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleCreateClick}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Cliente
              </Button>
            </div>

            {/* Estadísticas */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Total: {clients.length} clientes</span>
              {searchTerm && <span>Filtrados: {filteredClients.length}</span>}
            </div>

            {/* Tabla de clientes */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>NIT</TableHead>
                    <TableHead>Registro</TableHead>
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Cargando clientes...
                      </TableCell>
                    </TableRow>
                  ) : filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <User className="w-8 h-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            {searchTerm
                              ? "No se encontraron clientes"
                              : "No hay clientes registrados"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={client.foto} />
                              <AvatarFallback className="text-xs">
                                {getInitials(client.nombre, client.encargado)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{client.nombre}</div>
                              {client.encargado && (
                                <div className="text-xs text-muted-foreground">
                                  Encargado: {client.encargado}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              {formatWhatsApp(client.whatsapp)}
                            </div>
                            {client.email && (
                              <div className="text-xs text-muted-foreground">
                                {client.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{client.nit || "-"}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {formatDate(client.created_at)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditClick(client)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClient(client)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ClientForm
        client={editingClient}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={editingClient ? handleEditClient : handleCreateClient}
        loading={formLoading}
      />
    </>
  );
}



