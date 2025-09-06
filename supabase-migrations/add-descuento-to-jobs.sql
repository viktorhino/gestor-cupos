-- Migration: Add descuento field to jobs table
-- Date: 2024-01-XX
-- Description: Add descuento field to store discount amount for jobs

-- Add descuento column to jobs table
ALTER TABLE jobs 
ADD COLUMN descuento DECIMAL(12,2) DEFAULT 0 NOT NULL;

-- Add comment to describe the field
COMMENT ON COLUMN jobs.descuento IS 'Descuento aplicado al trabajo en pesos colombianos';

-- Update the total_estimado calculation to consider descuento
-- Note: This will be handled in the application logic, not in the database


