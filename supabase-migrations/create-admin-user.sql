-- Script para crear el usuario administrador inicial
-- Este script debe ejecutarse manualmente en Supabase después de configurar las políticas RLS

-- Insertar usuario administrador en la tabla users
-- NOTA: El ID debe coincidir con el ID del usuario en Supabase Auth
-- Reemplaza 'ADMIN_USER_ID_FROM_SUPABASE_AUTH' con el ID real del usuario

INSERT INTO users (
  id,
  nombre,
  email,
  rol,
  activo,
  created_at,
  updated_at
) VALUES (
  'ADMIN_USER_ID_FROM_SUPABASE_AUTH', -- Reemplazar con ID real
  'Administrador',
  'admin@tnv.com',
  'admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  email = EXCLUDED.email,
  rol = EXCLUDED.rol,
  activo = EXCLUDED.activo,
  updated_at = NOW();

-- Crear usuarios de ejemplo para cada rol (opcional)
-- Estos usuarios deben crearse primero en Supabase Auth

-- Usuario Operario
INSERT INTO users (
  id,
  nombre,
  email,
  rol,
  activo,
  created_at,
  updated_at
) VALUES (
  'OPERARIO_USER_ID_FROM_SUPABASE_AUTH', -- Reemplazar con ID real
  'Operario de Producción',
  'operario@tnv.com',
  'operario',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  email = EXCLUDED.email,
  rol = EXCLUDED.rol,
  activo = EXCLUDED.activo,
  updated_at = NOW();

-- Usuario Entregas
INSERT INTO users (
  id,
  nombre,
  email,
  rol,
  activo,
  created_at,
  updated_at
) VALUES (
  'ENTREGAS_USER_ID_FROM_SUPABASE_AUTH', -- Reemplazar con ID real
  'Responsable de Entregas',
  'entregas@tnv.com',
  'entregas',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  email = EXCLUDED.email,
  rol = EXCLUDED.rol,
  activo = EXCLUDED.activo,
  updated_at = NOW();

-- Usuario Comercial
INSERT INTO users (
  id,
  nombre,
  email,
  rol,
  activo,
  created_at,
  updated_at
) VALUES (
  'COMERCIAL_USER_ID_FROM_SUPABASE_AUTH', -- Reemplazar con ID real
  'Ejecutivo Comercial',
  'comercial@tnv.com',
  'comercial',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  email = EXCLUDED.email,
  rol = EXCLUDED.rol,
  activo = EXCLUDED.activo,
  updated_at = NOW();

