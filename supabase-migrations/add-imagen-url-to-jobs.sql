-- Migración para agregar el campo 'imagen_url' a la tabla jobs
-- Date: 2024-01-XX
-- Description: Add imagen_url field to store work images from Supabase Storage

-- Add imagen_url column to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS imagen_url TEXT;

-- Add comment to describe the field
COMMENT ON COLUMN jobs.imagen_url IS 'URL pública de la imagen del trabajo almacenada en Supabase Storage';

-- Crear bucket para imágenes de trabajos (ejecutar en Storage)
-- Bucket name: work-images
-- Public: true

-- Políticas RLS para el bucket work-images:
-- 1. Public Access (SELECT)
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'work-images');

-- 2. Authenticated users can upload (INSERT)
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'work-images' 
  AND auth.role() = 'authenticated'
);

-- 3. Authenticated users can update (UPDATE)
CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'work-images' 
  AND auth.role() = 'authenticated'
);

-- 4. Authenticated users can delete (DELETE)
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'work-images' 
  AND auth.role() = 'authenticated'
);
