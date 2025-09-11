-- Migración para actualizar tabla clientes
-- Cambiar 'nombre' por 'empresa' y agregar campos 'encargado' y 'tratamiento'

-- 1. Agregar nuevas columnas
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS empresa VARCHAR(255),
ADD COLUMN IF NOT EXISTS encargado VARCHAR(255),
ADD COLUMN IF NOT EXISTS tratamiento VARCHAR(100);

-- 2. Migrar datos existentes: copiar 'nombre' a 'empresa'
UPDATE clients 
SET empresa = nombre 
WHERE empresa IS NULL;

-- 3. Hacer 'empresa' NOT NULL después de migrar datos
ALTER TABLE clients 
ALTER COLUMN empresa SET NOT NULL;

-- 4. Eliminar la columna 'nombre' (opcional, comentado por seguridad)
-- ALTER TABLE clients DROP COLUMN nombre;

-- 5. Agregar índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_clients_empresa ON clients(empresa);
CREATE INDEX IF NOT EXISTS idx_clients_encargado ON clients(encargado);

-- 6. Verificar la estructura de la tabla
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;


