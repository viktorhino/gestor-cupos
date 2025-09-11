# Configuración de Ambientes

## Estructura de Ambientes

### 🚀 Producción (Production)

- **Rama**: `main`
- **URL**: `https://gestor-cupos.vercel.app`
- **Base de datos**: Supabase Production
- **Propósito**: Versión estable para usuarios finales

### 🧪 Staging (Pruebas)

- **Rama**: `develop`
- **URL**: `https://gestor-cupos-git-develop.vercel.app`
- **Base de datos**: Supabase Staging
- **Propósito**: Pruebas de integración antes de producción

### 💻 Desarrollo (Development)

- **Rama**: `feature/*`
- **URL**: `https://gestor-cupos-git-[branch-name].vercel.app`
- **Base de datos**: Supabase Development
- **Propósito**: Desarrollo de nuevas funcionalidades

## Configuración de Variables de Entorno

### Desarrollo Local

```bash
# Copiar archivo de ejemplo
cp env.example .env.local

# Editar variables
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
NEXT_PUBLIC_APP_ENV=development
```

### Vercel (Automático)

- Las variables se configuran en el dashboard de Vercel
- Se aplican automáticamente según el ambiente

## Flujo de Trabajo

1. **Desarrollo**: Trabajar en `feature/nueva-funcionalidad`
2. **Staging**: Merge a `develop` para pruebas
3. **Producción**: Merge a `main` para lanzamiento

## Comandos Útiles

```bash
# Crear nueva funcionalidad
git checkout develop
git checkout -b feature/nueva-funcionalidad

# Deploy a staging
git checkout develop
git merge feature/nueva-funcionalidad
git push origin develop

# Deploy a producción
git checkout main
git merge develop
git push origin main
```


