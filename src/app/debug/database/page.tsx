"use client";

import { useEffect, useState } from "react";
import { clientService } from "@/lib/services/clients";
import { jobService } from "@/lib/services/jobs";
import { cardReferenceService } from "@/lib/services/card-references";
import { flyerTypeService } from "@/lib/services/flyer-types";
import { specialFinishService } from "@/lib/services/special-finishes";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DatabaseDebugPage() {
  const [clients, setClients] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [cardReferences, setCardReferences] = useState([]);
  const [flyerTypes, setFlyerTypes] = useState([]);
  const [specialFinishes, setSpecialFinishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [
          clientsData,
          jobsData,
          cardRefsData,
          flyerTypesData,
          specialFinishesData,
        ] = await Promise.all([
          clientService.getClients(),
          jobService.getJobs(),
          cardReferenceService.getCardReferences(),
          flyerTypeService.getFlyerTypes(),
          specialFinishService.getSpecialFinishes(),
        ]);

        setClients(clientsData);
        setJobs(jobsData);
        setCardReferences(cardRefsData);
        setFlyerTypes(flyerTypesData);
        setSpecialFinishes(specialFinishesData);
        setError(null);
      } catch (err) {
        setError("Error al cargar datos de la base de datos");
        console.error("Database debug error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">
              Cargando datos de la base de datos...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-8">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Error de Conexión</CardTitle>
              <CardDescription className="text-red-600">
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-600">
                Verifica que las variables de entorno estén configuradas
                correctamente en el archivo .env.local
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Debug de Base de Datos</h1>
        <p className="text-gray-600 mb-8">
          Esta página muestra los datos reales de Supabase para verificar la
          conexión.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
              <Badge variant="secondary">Registros</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Trabajos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs.length}</div>
              <Badge variant="secondary">Registros</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Referencias de Tarjetas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cardReferences.length}</div>
              <Badge variant="secondary">Registros</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Tipos de Volantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{flyerTypes.length}</div>
              <Badge variant="secondary">Registros</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Clientes</CardTitle>
              <CardDescription>Lista de clientes registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {clients.map((client: any) => (
                  <div key={client.id} className="p-3 border rounded-lg">
                    <div className="font-medium">{client.empresa}</div>
                    <div className="text-sm text-gray-500">
                      {client.email} • {client.whatsapp}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Referencias de Tarjetas</CardTitle>
              <CardDescription>
                Catálogo de referencias disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cardReferences.map((ref: any) => (
                  <div key={ref.id} className="p-3 border rounded-lg">
                    <div className="font-medium">{ref.nombre}</div>
                    <div className="text-sm text-gray-500">
                      Grupo: {ref.grupo} • Precio: $
                      {ref.precio_base_por_millar?.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tipos de Volantes</CardTitle>
              <CardDescription>Catálogo de tipos disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {flyerTypes.map((type: any) => (
                  <div key={type.id} className="p-3 border rounded-lg">
                    <div className="font-medium">
                      {type.tamaño} - {type.modo}
                    </div>
                    <div className="text-sm text-gray-500">
                      Precio: ${type.precio_base_por_millar?.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Terminaciones Especiales</CardTitle>
              <CardDescription>
                Catálogo de terminaciones especiales disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {specialFinishes.map((finish: any) => (
                  <div key={finish.id} className="p-3 border rounded-lg">
                    <div className="font-medium">{finish.nombre}</div>
                    <div className="text-sm text-gray-500">
                      Precio: ${finish.precio_unit_por_millar?.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trabajos Recientes</CardTitle>
              <CardDescription>Últimos trabajos registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {jobs.slice(0, 5).map((job: any) => (
                  <div key={job.id} className="p-3 border rounded-lg">
                    <div className="font-medium">
                      #{job.consecutivo} - {job.tipo}
                    </div>
                    <div className="text-sm text-gray-500">
                      Cliente: {job.clients?.nombre} • Estado: {job.estado}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
