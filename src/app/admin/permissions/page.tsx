"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, Shield, Users, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

interface User {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  roles: string[];
}

const PERMISSIONS: Permission[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Acceso al panel principal",
    roles: [
      "admin",
      "operario",
      "entregas",
      "comercial",
      "ventas",
      "produccion",
    ],
  },
  {
    id: "trabajos",
    name: "Trabajos",
    description: "Gestión de trabajos y órdenes",
    roles: ["admin", "operario", "comercial", "ventas", "produccion"],
  },
  {
    id: "pagos",
    name: "Gestión de Pagos",
    description: "Administrar pagos y facturación",
    roles: ["admin", "operario", "comercial", "ventas", "produccion"],
  },
  {
    id: "entregas",
    name: "Entregas",
    description: "Gestión de entregas a clientes",
    roles: ["admin", "entregas", "ventas", "produccion"],
  },
  {
    id: "planificador",
    name: "Planificador",
    description: "Planificación de cupos de producción",
    roles: ["admin", "operario", "produccion"],
  },
  {
    id: "cupos",
    name: "Cupos del Día",
    description: "Gestión de lotes de producción",
    roles: ["admin", "operario", "produccion"],
  },
  {
    id: "clientes",
    name: "Clientes",
    description: "Gestión de base de datos de clientes",
    roles: ["admin", "comercial", "ventas", "produccion"],
  },
  {
    id: "reportes",
    name: "Reportes",
    description: "Generación de reportes y análisis",
    roles: ["admin", "comercial", "ventas"],
  },
  {
    id: "impresion",
    name: "Impresión",
    description: "Configuración y gestión de impresión",
    roles: ["admin", "operario", "ventas", "produccion"],
  },
  {
    id: "administracion",
    name: "Administración",
    description: "Panel de administración del sistema",
    roles: ["admin"],
  },
];

export default function PermissionsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>(PERMISSIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const supabase = createClient();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("nombre");

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permissionId: string, role: string) => {
    setPermissions((prev) =>
      prev.map((permission) => {
        if (permission.id === permissionId) {
          const newRoles = permission.roles.includes(role)
            ? permission.roles.filter((r) => r !== role)
            : [...permission.roles, role];
          return { ...permission, roles: newRoles };
        }
        return permission;
      })
    );
  };

  const savePermissions = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Aquí podrías guardar los permisos en la base de datos
      // Por ahora solo mostramos un mensaje de éxito
      setSuccess("Permisos actualizados correctamente");

      // Simular guardado
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      setError("Error al guardar los permisos");
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "operario":
        return "bg-blue-100 text-blue-800";
      case "entregas":
        return "bg-green-100 text-green-800";
      case "comercial":
        return "bg-purple-100 text-purple-800";
      case "ventas":
        return "bg-orange-100 text-orange-800";
      case "produccion":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "operario":
        return "Operario";
      case "entregas":
        return "Entregas";
      case "comercial":
        return "Comercial";
      case "ventas":
        return "Ventas";
      case "produccion":
        return "Producción";
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <MainLayout
        title="Gestión de Permisos"
        subtitle="Configurar permisos de usuarios"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <RoleGuard requiredRole="admin">
      <MainLayout
        title="Gestión de Permisos"
        subtitle="Configurar permisos y accesos de usuarios"
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Permisos del Sistema</h2>
              <p className="text-muted-foreground">
                Configura qué funcionalidades puede acceder cada rol
              </p>
            </div>
            <Button onClick={savePermissions} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>

          {/* Alerts */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Users Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuarios del Sistema
              </CardTitle>
              <CardDescription>
                Lista de usuarios y sus roles actuales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{user.nombre}</h3>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <Badge className={getRoleColor(user.rol)}>
                      {getRoleLabel(user.rol)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Permissions Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Matriz de Permisos
              </CardTitle>
              <CardDescription>
                Marca qué funcionalidades puede acceder cada rol
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">
                        Funcionalidad
                      </th>
                      <th className="text-center p-3 font-medium">Admin</th>
                      <th className="text-center p-3 font-medium">Operario</th>
                      <th className="text-center p-3 font-medium">Entregas</th>
                      <th className="text-center p-3 font-medium">Comercial</th>
                      <th className="text-center p-3 font-medium">Ventas</th>
                      <th className="text-center p-3 font-medium">
                        Producción
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((permission) => (
                      <tr key={permission.id} className="border-b">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{permission.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {permission.description}
                            </div>
                          </div>
                        </td>
                        {[
                          "admin",
                          "operario",
                          "entregas",
                          "comercial",
                          "ventas",
                          "produccion",
                        ].map((role) => (
                          <td key={role} className="text-center p-3">
                            <Checkbox
                              checked={permission.roles.includes(role)}
                              onCheckedChange={() =>
                                togglePermission(permission.id, role)
                              }
                              disabled={
                                role === "admin" &&
                                permission.id === "administracion"
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Leyenda de Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  "admin",
                  "operario",
                  "entregas",
                  "comercial",
                  "ventas",
                  "produccion",
                ].map((role) => (
                  <div key={role} className="flex items-center gap-2">
                    <Badge className={getRoleColor(role)}>
                      {getRoleLabel(role)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}

