"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Client } from "@/lib/types/client";
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
} from "lucide-react";

interface ClientListProps {
  clients: Client[];
  loading: boolean;
  onCreateClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
}

export function ClientList({
  clients,
  loading,
  onCreateClient,
  onEditClient,
  onDeleteClient,
}: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted animate-pulse rounded w-64"></div>
          <div className="h-10 bg-muted animate-pulse rounded w-32"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted animate-pulse rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        <div className="flex gap-2">
          <Button
            variant={viewMode === "cards" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("cards")}
          >
            Tarjetas
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            Tabla
          </Button>
          <Button onClick={onCreateClient}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>Total: {clients.length} clientes</span>
        {searchTerm && <span>Filtrados: {filteredClients.length}</span>}
      </div>

      {/* Vista de tarjetas */}
      {viewMode === "cards" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={client.foto} />
                      <AvatarFallback>
                        {getInitials(client.nombre, client.encargado)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">
                        {client.nombre}
                      </h3>
                      {client.encargado && (
                        <p className="text-sm text-muted-foreground">
                          Encargado: {client.encargado}
                        </p>
                      )}
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          <span>{formatWhatsApp(client.whatsapp)}</span>
                        </div>
                        {client.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{client.email}</span>
                          </div>
                        )}
                        {client.nit && (
                          <div className="flex items-center gap-2">
                            <FileText className="w-3 h-3" />
                            <span>NIT: {client.nit}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditClient(client)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteClient(client)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {client.direccion && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{client.direccion}</span>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    Cliente desde {formatDate(client.created_at)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vista de tabla */}
      {viewMode === "table" && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>NIT</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
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
                    <span className="text-sm">{client.direccion || "-"}</span>
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
                        <DropdownMenuItem onClick={() => onEditClient(client)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteClient(client)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Estado vacío */}
      {filteredClients.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm
                ? "No se encontraron clientes"
                : "No hay clientes registrados"}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm
                ? "Intenta cambiar los términos de búsqueda"
                : "Comienza agregando tu primer cliente"}
            </p>
            {!searchTerm && (
              <Button onClick={onCreateClient}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Cliente
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
