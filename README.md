# T&V Cupos - Sistema de Gestión de Producción

Sistema web para la gestión de producción de tarjetas y volantes de la empresa T&V Impresiones.

## 🚀 Características

### Funcionalidades Principales

- **Recepción de Trabajos**: Formulario completo para capturar órdenes de clientes
- **Dashboard en Tiempo Real**: Monitoreo del estado de producción y entregas
- **Gestión de Entregas**: Interfaz para entregar trabajos a clientes
- **Planificador de Cupos**: Herramienta para agrupar trabajos en lotes de producción
- **Historial de Cupos**: Seguimiento y costeo de lotes producidos
- **Sistema de Impresión**: Impresión térmica de órdenes y comprobantes
- **Reportes**: Análisis de ventas, costos y rendimiento
- **Administración**: Gestión de precios, catálogos y configuraciones

### Tecnologías Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Shadcn/ui, Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Validación**: Zod, React Hook Form
- **Iconos**: Lucide React
- **Impresión**: QZ Tray, HTML2Canvas, jsPDF

## 📋 Requisitos del Sistema

### Tarjetas

- **Tipos**: Brillo UV, Mate 2L, Reserva 1L, Reserva 2L
- **Grupos**: Brillo (solo), Mate-Reserva (compatibles entre sí)
- **Terminaciones Especiales**: Perforación, Despuntadas, Estampado, Repujado, Troquelado
- **Mínimo**: 1,000 unidades por pedido

### Volantes

- **Tamaños**: Media Carta, Cuarto Carta, Mini Volante
- **Modos**: 4x0, 4x1, 4x4
- **Mínimo**: 1,000 unidades por pedido

### Reglas de Negocio

- Los cupos pueden ser de una sola referencia o mixtos
- Cupos mixtos: Brillo + Mate-Reserva en múltiplos de 3 hasta 30 piezas
- No se pueden mezclar tarjetas y volantes en el mismo cupo
- Cada ítem define cuántas "piezas de cupo" ocupa

## 🛠️ Instalación

1. **Clonar el repositorio**

   ```bash
   git clone <repository-url>
   cd tnv-cupos
   ```

2. **Instalar dependencias**

   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**

   ```bash
   cp .env.example .env.local
   ```

   Editar `.env.local` con las credenciales de Supabase:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Configurar la base de datos**

   ```bash
   # Ejecutar el script SQL en Supabase
   # El archivo supabase-schema.sql contiene todas las tablas necesarias
   ```

5. **Ejecutar el servidor de desarrollo**

   ```bash
   pnpm dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📁 Estructura del Proyecto

```
tnv-cupos/
├── src/
│   ├── app/                    # Páginas de Next.js
│   │   ├── admin/             # Panel de administración
│   │   ├── batches/           # Historial de cupos
│   │   ├── deliveries/        # Gestión de entregas
│   │   ├── planner/           # Planificador de cupos
│   │   ├── printing/          # Configuración de impresión
│   │   ├── reception/         # Recepción de trabajos
│   │   └── reports/           # Reportes
│   ├── components/            # Componentes React
│   │   ├── admin/             # Componentes de administración
│   │   ├── batch/             # Componentes de cupos
│   │   ├── delivery/          # Componentes de entregas
│   │   ├── forms/             # Formularios
│   │   ├── layout/            # Layout y navegación
│   │   ├── planner/           # Componentes del planificador
│   │   ├── printing/          # Componentes de impresión
│   │   ├── reports/           # Componentes de reportes
│   │   └── ui/                # Componentes base (Shadcn/ui)
│   ├── lib/                   # Utilidades y configuración
│   │   ├── printing/          # Servicios de impresión
│   │   ├── supabase/          # Configuración de Supabase
│   │   └── types/             # Tipos TypeScript
│   └── styles/                # Estilos globales
├── public/                    # Archivos estáticos
├── supabase-schema.sql        # Esquema de la base de datos
└── README.md                  # Este archivo
```

## 🎯 Flujo de Trabajo

### 1. Recepción de Trabajos

- Cliente solicita tarjetas o volantes
- Se capturan detalles: referencia, cantidad, terminaciones especiales
- Se calcula precio según tabla de precios
- Se registra abono (opcional)
- Se imprime orden de producción

### 2. Planificación de Cupos

- Se agrupan trabajos compatibles
- Se valida compatibilidad según reglas de negocio
- Se crea cupo o se asigna a proveedor externo
- Se actualiza estado de trabajos

### 3. Producción

- Se procesa el cupo
- Se actualiza estado a "impreso" o "terminado"
- Se registran costos de producción

### 4. Entrega

- Cliente recoge el trabajo
- Se registra pago (si aplica)
- Se imprime comprobante de entrega
- Se actualiza estado a "entregado"

## 🔧 Configuración

### Impresión Térmica

1. Instalar QZ Tray en el sistema
2. Configurar impresora térmica (80mm recomendado)
3. Configurar en la sección "Impresión" del sistema

### Base de Datos

- PostgreSQL con Supabase
- Esquema completo en `supabase-schema.sql`
- Incluye tablas para clientes, trabajos, cupos, costos, etc.

### Autenticación

- Integrado con Supabase Auth
- Roles: Admin, Operario, Entregas, Comercial
- Control de acceso basado en roles (RLS)

## 📊 Reportes Disponibles

- **Ventas**: Por período, cliente y referencia
- **Costos**: Análisis de márgenes por cupo
- **Producción**: Eficiencia y rendimiento
- **Clientes**: Comportamiento y satisfacción

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### Otras Plataformas

- Netlify
- Railway
- DigitalOcean App Platform

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto es privado y pertenece a T&V Impresiones.

## 📞 Soporte

Para soporte técnico o consultas:

- Email: soporte@tveimpresiones.com
- Teléfono: +57 (1) 234-5678

---

**T&V Impresiones** - Sistema de Gestión de Producción v1.0

## 🌍 Ambientes

- **Desarrollo**: Rama `develop` - Esquema `development`
- **Staging**: Rama `staging` - Esquema `staging`
- **Producción**: Rama `main` - Esquema `public`

### 🚀 Deploy Status

- **Development**: ✅ Funcionando
- **Staging**: 🔄 En proceso de deploy (Commit: e1357bd)
- **Production**: ✅ Funcionando

### 🔧 Troubleshooting
- **Vercel**: No detecta commits recientes
- **GitHub**: Commits subidos correctamente
- **Solución**: Forzar redeploy manual