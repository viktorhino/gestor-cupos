-- Agregar campo es_1x2 a la tabla jobs
-- Este campo indica si el precio base debe calcularse dividiendo los millares entre 2

ALTER TABLE jobs 
ADD COLUMN es_1x2 BOOLEAN DEFAULT FALSE;

-- Agregar comentario para explicar el campo
COMMENT ON COLUMN jobs.es_1x2 IS 'Indica si el precio base debe calcularse dividiendo los millares entre 2. No afecta el cálculo de terminaciones especiales.';





