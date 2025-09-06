"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  FileText,
  Package,
  Truck,
  Calendar,
  Settings,
  Users,
  BarChart3,
  Printer,
  CreditCard,
  Building2,
  ClipboardList,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Trabajos",
    href: "/trabajos",
    icon: FileText,
  },
  {
    name: "Gestión de Pagos",
    href: "/payments",
    icon: CreditCard,
  },
  {
    name: "Entregas",
    href: "/deliveries",
    icon: Truck,
  },
  {
    name: "Planificador",
    href: "/planner",
    icon: Package,
  },
  {
    name: "Cupos del Día",
    href: "/batches",
    icon: Calendar,
  },
  {
    name: "Clientes",
    href: "/clients",
    icon: Users,
  },
  {
    name: "Reportes",
    href: "/reports",
    icon: BarChart3,
  },
  {
    name: "Impresión",
    href: "/printing",
    icon: Printer,
  },
];

const adminNavigation = [
  {
    name: "Administración",
    href: "/admin",
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn("flex h-full w-64 flex-col bg-card border-r", className)}
    >
      {/* Header */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">T&V Cupos</h1>
            <p className="text-xs text-muted-foreground">
              Gestión de Producción
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.name}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-accent text-accent-foreground"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Administración
          </p>
          {adminNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.name}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-accent text-accent-foreground"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          <p>T&V Impresiones</p>
          <p>Sistema de Gestión v1.0</p>
        </div>
      </div>
    </div>
  );
}
