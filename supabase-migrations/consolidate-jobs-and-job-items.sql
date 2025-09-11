-- Migración para consolidar jobs y job_items en una sola tabla
-- Fecha: 2024-01-XX
-- Descripción: Mover todos los campos de job_items a jobs y eliminar job_items

-- Paso 1: Agregar las columnas de job_items a la tabla jobs
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS card_reference_id UUID REFERENCES card_references(id),
ADD COLUMN IF NOT EXISTS flyer_type_id UUID REFERENCES flyer_types(id),
ADD COLUMN IF NOT EXISTS ocupacion_cupo INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS cantidad_millares INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS terminaciones_especiales JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS observaciones TEXT;

-- Paso 2: Migrar los datos existentes de job_items a jobs
UPDATE jobs 
SET 
  card_reference_id = ji.card_reference_id,
  flyer_type_id = ji.flyer_type_id,
  ocupacion_cupo = ji.ocupacion_cupo,
  cantidad_millares = ji.cantidad_millares,
  terminaciones_especiales = ji.terminaciones_especiales,
  observaciones = ji.observaciones
FROM job_items ji 
WHERE jobs.id = ji.job_id;

-- Paso 3: Hacer las columnas NOT NULL después de migrar los datos
ALTER TABLE jobs 
ALTER COLUMN ocupacion_cupo SET NOT NULL,
ALTER COLUMN cantidad_millares SET NOT NULL;

-- Paso 4: Eliminar la tabla job_items (¡CUIDADO! Hacer backup primero)
-- DROP TABLE job_items;

-- Paso 5: Comentarios para documentar las nuevas columnas
COMMENT ON COLUMN jobs.card_reference_id IS 'Referencia de tarjeta (solo para trabajos de tarjetas)';
COMMENT ON COLUMN jobs.flyer_type_id IS 'Tipo de volante (solo para trabajos de volantes)';
COMMENT ON COLUMN jobs.ocupacion_cupo IS 'Cantidad de cupos que ocupa el trabajo';
COMMENT ON COLUMN jobs.cantidad_millares IS 'Cantidad en millares del trabajo';
COMMENT ON COLUMN jobs.terminaciones_especiales IS 'Array JSON con terminaciones especiales aplicadas';
COMMENT ON COLUMN jobs.observaciones IS 'Observaciones específicas del trabajo';

-- Verificar que la migración fue exitosa
SELECT 
  j.id,
  j.nombre_trabajo,
  j.tipo,
  j.card_reference_id,
  j.flyer_type_id,
  j.ocupacion_cupo,
  j.cantidad_millares,
  j.terminaciones_especiales,
  j.observaciones
FROM jobs j
LIMIT 5;





