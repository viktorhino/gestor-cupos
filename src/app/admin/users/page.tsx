"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, User, Trash2, Edit } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

interface User {
  id: string;
  nombre: string;
  email: string;
  rol:
    | "admin"
    | "operario"
    | "entregas"
    | "comercial"
    | "ventas"
    | "produccion";
  activo: boolean;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "operario" as const,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const supabase = createClient();

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true,
        });

      if (authError) throw authError;

      // Crear perfil en la tabla users
      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user.id,
        nombre: formData.nombre,
        email: formData.email,
        rol: formData.rol,
        activo: true,
      });

      if (profileError) throw profileError;

      setSuccess("Usuario creado exitosamente");
      setFormData({ nombre: "", email: "", password: "", rol: "operario" });
      setShowForm(false);
      loadUsers();
    } catch (err: any) {
      setError(err.message || "Error al crear usuario");
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ activo: !currentStatus })
        .eq("id", userId);

      if (error) throw error;
      loadUsers();
    } catch (err) {
      console.error("Error updating user status:", err);
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

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <RoleGuard requiredRole="admin">
      <MainLayout
        title="Gestión de Usuarios"
        subtitle="Administrar usuarios y permisos del sistema"
      >
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Usuarios del Sistema</h2>
              <p className="text-muted-foreground">
                Gestiona los usuarios y sus permisos de acceso
              </p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
          </div>

          {/* Formulario de nuevo usuario */}
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Crear Nuevo Usuario</CardTitle>
                <CardDescription>
                  Completa la información para crear un nuevo usuario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre Completo</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) =>
                          setFormData({ ...formData, nombre: e.target.value })
                        }
                        placeholder="Juan Pérez"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="usuario@tnv.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rol">Rol</Label>
                      <Select
                        value={formData.rol}
                        onValueChange={(value) =>
                          setFormData({ ...formData, rol: value as any })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="operario">Operario</SelectItem>
                          <SelectItem value="entregas">Entregas</SelectItem>
                          <SelectItem value="comercial">Comercial</SelectItem>
                          <SelectItem value="ventas">Ventas</SelectItem>
                          <SelectItem value="produccion">Producción</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      <User className="mr-2 h-4 w-4" />
                      Crear Usuario
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Lista de usuarios */}
          <Card>
            <CardHeader>
              <CardTitle>Usuarios Registrados</CardTitle>
              <CardDescription>
                Lista de todos los usuarios del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{user.nombre}</h3>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getRoleColor(user.rol)}>
                              {getRoleLabel(user.rol)}
                            </Badge>
                            <Badge
                              variant={user.activo ? "default" : "secondary"}
                            >
                              {user.activo ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUserStatus(user.id, user.activo)}
                        >
                          {user.activo ? "Desactivar" : "Activar"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
