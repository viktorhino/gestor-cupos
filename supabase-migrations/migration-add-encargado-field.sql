-- Migración para agregar el campo 'encargado' a la tabla clients
-- Ejecutar este script en Supabase SQL Editor

-- Agregar el campo 'encargado' como opcional
ALTER TABLE clients ADD COLUMN encargado VARCHAR(255);

-- Hacer el campo 'whatsapp' obligatorio (esto puede fallar si hay registros con whatsapp NULL)
-- Primero actualizamos los registros existentes que tengan whatsapp NULL
UPDATE clients SET whatsapp = 'Sin WhatsApp' WHERE whatsapp IS NULL;

-- Ahora hacemos el campo obligatorio
ALTER TABLE clients ALTER COLUMN whatsapp SET NOT NULL;

