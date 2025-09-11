"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  requiredRole,
  requiredRoles,
  fallback,
}: RoleGuardProps) {
  const { profile, loading, canAccess, hasAnyRole } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto mt-8">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          No tienes permisos para acceder a esta sección.
        </AlertDescription>
      </Alert>
    );
  }

  // Verificar rol específico
  if (requiredRole && !canAccess(requiredRole)) {
    return (
      fallback || (
        <div className="max-w-md mx-auto mt-8">
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              No tienes permisos para acceder a esta sección. Se requiere rol:{" "}
              <strong>{requiredRole}</strong>
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
      )
    );
  }

  // Verificar múltiples roles
  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return (
      fallback || (
        <div className="max-w-md mx-auto mt-8">
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              No tienes permisos para acceder a esta sección. Se requiere uno de
              los siguientes roles: <strong>{requiredRoles.join(", ")}</strong>
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
      )
    );
  }

  return <>{children}</>;
}

