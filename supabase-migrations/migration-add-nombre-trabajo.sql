-- Migration: Add nombre_trabajo field to jobs table
-- Execute this in Supabase SQL Editor

-- Add the nombre_trabajo column to the jobs table
ALTER TABLE jobs ADD COLUMN nombre_trabajo VARCHAR(255);

-- Add a comment to document the field
COMMENT ON COLUMN jobs.nombre_trabajo IS 'Nombre descriptivo del trabajo (ej: Panadería Las Rosas, Parqueadero El Portal)';

