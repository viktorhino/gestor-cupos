-- Update clients table to add missing fields
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS apellido VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS foto TEXT;

-- Update the existing client data to have a default apellido if needed
UPDATE clients SET apellido = 'Sin Apellido' WHERE apellido = '' OR apellido IS NULL;

-- Add a comment to document the change
COMMENT ON TABLE clients IS 'Updated to include apellido and foto fields for complete client management';