"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Printer,
  Wifi,
  WifiOff,
  TestTube,
  Save,
  RefreshCw,
} from "lucide-react";
import { thermalPrinter } from "@/lib/printing/thermal-printer";

interface PrinterConfig {
  enabled: boolean;
  printerName: string;
  paperWidth: number;
  paperHeight: number;
  dpi: number;
  autoConnect: boolean;
  retryAttempts: number;
  timeout: number;
}

export function PrinterConfig() {
  const [config, setConfig] = useState<PrinterConfig>({
    enabled: true,
    printerName: "Impresora Térmica 80mm",
    paperWidth: 80,
    paperHeight: 0,
    dpi: 203,
    autoConnect: true,
    retryAttempts: 3,
    timeout: 5000,
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>("");

  useEffect(() => {
    // Cargar configuración guardada
    const savedConfig = localStorage.getItem("printer-config");
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("printer-config", JSON.stringify(config));
    setTestResult("Configuración guardada correctamente");
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const connected = await thermalPrinter.connect();
      setIsConnected(connected);
      setTestResult(connected ? "Conectado exitosamente" : "Error al conectar");
    } catch (error) {
      setTestResult("Error: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await thermalPrinter.disconnect();
      setIsConnected(false);
      setTestResult("Desconectado");
    } catch (error) {
      setTestResult("Error al desconectar: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPrint = async () => {
    setIsLoading(true);
    try {
      const testJob = {
        id: "test",
        type: "production_order" as const,
        data: {
          clientName: "Cliente de Prueba",
          consecutive: "TEST-001",
          date: new Date().toLocaleString(),
          items: [
            {
              reference: "Brillo UV",
              quantity: 1000,
              specialFinishes: ["Perforación"],
              observations: "Prueba de impresión",
            },
          ],
          total: 15000,
          downPayment: 5000,
          notes: "Esta es una prueba de impresión del sistema T&V Cupos",
        },
      };

      const success = await thermalPrinter.printProductionOrder(testJob);
      setTestResult(
        success
          ? "Prueba de impresión exitosa"
          : "Error en la prueba de impresión"
      );
    } catch (error) {
      setTestResult("Error en la prueba: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configuración de Impresión</h2>
          <p className="text-muted-foreground">
            Configura la impresora térmica y realiza pruebas de impresión
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "success" : "destructive"}>
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Conectado
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Desconectado
              </>
            )}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Impresora</CardTitle>
            <CardDescription>
              Ajusta los parámetros de la impresora térmica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">Habilitar Impresión</Label>
              <Switch
                id="enabled"
                checked={config.enabled}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, enabled: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="printerName">Nombre de la Impresora</Label>
              <Input
                id="printerName"
                value={config.printerName}
                onChange={(e) =>
                  setConfig({ ...config, printerName: e.target.value })
                }
                placeholder="Impresora Térmica 80mm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paperWidth">Ancho del Papel (mm)</Label>
                <Input
                  id="paperWidth"
                  type="number"
                  value={config.paperWidth}
                  onChange={(e) =>
                    setConfig({ ...config, paperWidth: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dpi">DPI</Label>
                <Select
                  value={config.dpi.toString()}
                  onValueChange={(value) =>
                    setConfig({ ...config, dpi: Number(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="203">203 DPI</SelectItem>
                    <SelectItem value="300">300 DPI</SelectItem>
                    <SelectItem value="600">600 DPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="autoConnect">Conexión Automática</Label>
              <Switch
                id="autoConnect"
                checked={config.autoConnect}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, autoConnect: checked })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="retryAttempts">Intentos de Reconexión</Label>
                <Input
                  id="retryAttempts"
                  type="number"
                  min="1"
                  max="10"
                  value={config.retryAttempts}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      retryAttempts: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min="1000"
                  max="30000"
                  value={config.timeout}
                  onChange={(e) =>
                    setConfig({ ...config, timeout: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <Button onClick={handleSave} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Guardar Configuración
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pruebas de Impresión</CardTitle>
            <CardDescription>
              Conecta y prueba la impresora térmica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={handleConnect}
                disabled={isLoading || isConnected}
                className="flex-1"
              >
                <Wifi className="h-4 w-4 mr-2" />
                Conectar
              </Button>
              <Button
                onClick={handleDisconnect}
                disabled={isLoading || !isConnected}
                variant="outline"
                className="flex-1"
              >
                <WifiOff className="h-4 w-4 mr-2" />
                Desconectar
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Prueba de Impresión</Label>
              <Button
                onClick={handleTestPrint}
                disabled={isLoading || !isConnected}
                className="w-full"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Imprimir Prueba
              </Button>
            </div>

            {testResult && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">{testResult}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Estado de la Conexión</Label>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-sm">
                  {isConnected ? "Conectado a QZ Tray" : "Desconectado"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plantillas de Impresión</CardTitle>
          <CardDescription>
            Personaliza las plantillas de orden de producción y comprobante de
            entrega
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Orden de Producción</Label>
              <p className="text-sm text-muted-foreground">
                Plantilla para imprimir al recibir un trabajo
              </p>
              <Button variant="outline" className="w-full">
                <Printer className="h-4 w-4 mr-2" />
                Personalizar Plantilla
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Comprobante de Entrega</Label>
              <p className="text-sm text-muted-foreground">
                Plantilla para imprimir al entregar un trabajo
              </p>
              <Button variant="outline" className="w-full">
                <Printer className="h-4 w-4 mr-2" />
                Personalizar Plantilla
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



