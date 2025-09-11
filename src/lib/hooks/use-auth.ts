"use client";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/browser";

export interface UserProfile {
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
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    };

    getInitialSession();

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // Si no hay perfil en la tabla users, crear uno temporal
        setProfile({
          id: userId,
          nombre: "Usuario Demo",
          email: "demo@tnv.com",
          rol: "admin",
          activo: true,
        });
        return;
      }

      setProfile(data);
    } catch (error) {
      // Crear perfil temporal en caso de error
      setProfile({
        id: userId,
        nombre: "Usuario Demo",
        email: "demo@tnv.com",
        rol: "admin",
        activo: true,
      });
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      // Error al cerrar sesión
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: string) => {
    return profile?.rol === role;
  };

  const hasAnyRole = (roles: string[]) => {
    return profile?.rol && roles.includes(profile.rol);
  };

  const canAccess = (requiredRole?: string) => {
    if (!requiredRole) return true;
    if (!profile) return false;

    // Admin puede acceder a todo
    if (profile.rol === "admin") return true;

    // Verificar rol específico
    return profile.rol === requiredRole;
  };

  return {
    user,
    profile,
    loading,
    signOut,
    hasRole,
    hasAnyRole,
    canAccess,
    isAuthenticated: !!user,
  };
}
