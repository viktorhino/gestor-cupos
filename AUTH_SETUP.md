# 🔐 Configuración del Sistema de Autenticación

Este documento explica cómo configurar y usar el sistema de autenticación implementado en T&V Cupos.

## 📋 Características Implementadas

### ✅ **Sistema de Autenticación Completo**

- **Página de Login** (`/login`) con formulario moderno
- **Middleware de autenticación** que protege todas las rutas
- **Hook useAuth** para manejar estado de autenticación
- **Sistema de roles y permisos** granular
- **Gestión de usuarios** (solo administradores)
- **Políticas RLS** en Supabase para seguridad

### 🎭 **Roles Disponibles**

- **Admin**: Acceso completo al sistema
- **Operario**: Gestión de producción y trabajos
- **Entregas**: Gestión de entregas y clientes
- **Comercial**: Gestión de clientes y ventas

## 🚀 Configuración Inicial

### 1. **Configurar Supabase Auth**

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Authentication > Settings**
3. Configura los proveedores de autenticación que desees usar
4. Asegúrate de que **Email** esté habilitado

### 2. **Ejecutar Migraciones de Base de Datos**

Ejecuta los siguientes archivos SQL en tu base de datos Supabase:

```sql
-- 1. Primero ejecuta las políticas RLS
-- Archivo: supabase-migrations/supabase-auth-rls-policies.sql

-- 2. Luego crea los usuarios iniciales
-- Archivo: supabase-migrations/create-admin-user.sql
```

### 3. **Crear Usuario Administrador**

1. Ve a **Authentication > Users** en Supabase Dashboard
2. Crea un nuevo usuario con:
   - Email: `admin@tnv.com`
   - Password: (una contraseña segura)
3. Copia el **User ID** generado
4. Actualiza el archivo `create-admin-user.sql` con el ID real
5. Ejecuta el script actualizado

### 4. **Configurar Variables de Entorno**

Asegúrate de que tu archivo `.env.local` tenga:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
NEXT_PUBLIC_DATABASE_SCHEMA=public
```

## 🎯 Uso del Sistema

### **Iniciar Sesión**

1. Ve a `http://localhost:3000/login`
2. Ingresa las credenciales del usuario administrador
3. Serás redirigido al dashboard principal

### **Gestión de Usuarios** (Solo Administradores)

1. Ve a **Administración > Usuarios**
2. Haz clic en **Nuevo Usuario**
3. Completa el formulario con:
   - Nombre completo
   - Email
   - Contraseña (mínimo 6 caracteres)
   - Rol del usuario
4. El usuario será creado automáticamente en Supabase Auth

### **Control de Acceso por Roles**

El sistema filtra automáticamente las opciones del menú según el rol:

- **Admin**: Ve todas las opciones
- **Operario**: Ve trabajos, pagos, planificador, cupos, impresión
- **Entregas**: Ve entregas y dashboard
- **Comercial**: Ve clientes, trabajos, pagos, reportes

## 🔒 Seguridad Implementada

### **Políticas RLS (Row Level Security)**

- Cada tabla tiene políticas específicas por rol
- Los usuarios solo pueden acceder a datos permitidos
- Las operaciones están restringidas según el rol

### **Middleware de Autenticación**

- Protege todas las rutas excepto `/login`
- Redirige automáticamente si no hay sesión
- Previene acceso no autorizado

### **Componente RoleGuard**

- Protege componentes específicos
- Muestra mensajes de error apropiados
- Permite fallbacks personalizados

## 🛠️ Desarrollo

### **Hook useAuth**

```typescript
const {
  user, // Usuario de Supabase Auth
  profile, // Perfil de la tabla users
  loading, // Estado de carga
  signOut, // Función para cerrar sesión
  hasRole, // Verificar rol específico
  hasAnyRole, // Verificar múltiples roles
  canAccess, // Verificar acceso a funcionalidad
  isAuthenticated, // Estado de autenticación
} = useAuth();
```

### **Proteger Componentes**

```typescript
<RoleGuard requiredRole="admin">
  <AdminComponent />
</RoleGuard>

<RoleGuard requiredRoles={['operario', 'admin']}>
  <ProductionComponent />
</RoleGuard>
```

### **Proteger Páginas Completas**

```typescript
export default function AdminPage() {
  return (
    <RoleGuard requiredRole="admin">
      <MainLayout>{/* Contenido de la página */}</MainLayout>
    </RoleGuard>
  );
}
```

## 🐛 Solución de Problemas

### **Error: "No tienes permisos"**

- Verifica que el usuario tenga el rol correcto en la tabla `users`
- Asegúrate de que las políticas RLS estén configuradas

### **Error: "Usuario no encontrado"**

- Verifica que el usuario exista en la tabla `users`
- Asegúrate de que el ID coincida con Supabase Auth

### **Error de autenticación**

- Verifica las variables de entorno
- Asegúrate de que Supabase Auth esté configurado correctamente

## 📝 Notas Importantes

1. **Siempre recuerda en qué esquema de base de datos estás trabajando** [[memory:8579480]]
2. **Los usuarios deben crearse primero en Supabase Auth antes de agregarlos a la tabla `users`**
3. **Las políticas RLS se aplican automáticamente, no necesitas verificarlas manualmente**
4. **El sistema está diseñado para ser seguro por defecto - cuando hay dudas, deniega el acceso**

## 🎉 ¡Listo!

Tu sistema de autenticación está completamente configurado y listo para usar. Los usuarios pueden iniciar sesión, el sistema respeta los roles y permisos, y todas las rutas están protegidas.

