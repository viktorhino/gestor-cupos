-- Verificar que la columna imagen_url existe en la tabla jobs
-- Si no existe, la creamos

-- Verificar si la columna existe
DO $$
BEGIN
    -- Intentar agregar la columna si no existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'imagen_url'
    ) THEN
        ALTER TABLE jobs ADD COLUMN imagen_url TEXT;
        RAISE NOTICE 'Columna imagen_url agregada a la tabla jobs';
    ELSE
        RAISE NOTICE 'Columna imagen_url ya existe en la tabla jobs';
    END IF;
END $$;

-- Verificar la estructura actual de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' 
ORDER BY ordinal_position;


