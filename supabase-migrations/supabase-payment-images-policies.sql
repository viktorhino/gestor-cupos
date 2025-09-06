-- =====================================================
-- POLÍTICAS DE ACCESO PARA BUCKET 'payment-images'
-- =====================================================
-- Este archivo contiene las políticas necesarias para el bucket de imágenes de pagos
-- Ejecutar en el SQL Editor de Supabase

-- =====================================================
-- 1. POLÍTICA DE LECTURA PÚBLICA
-- =====================================================
-- Permite a cualquier usuario (autenticado o no) leer las imágenes
-- Esto es necesario para mostrar las imágenes en la interfaz

CREATE POLICY "Public read access for payment images" ON storage.objects
FOR SELECT USING (bucket_id = 'payment-images');

-- =====================================================
-- 2. POLÍTICA DE ESCRITURA AUTENTICADA
-- =====================================================
-- Permite a usuarios autenticados subir imágenes de pagos
-- Solo se puede subir archivos de imagen

CREATE POLICY "Authenticated users can upload payment images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'payment-images' 
  AND auth.role() = 'authenticated'
  AND (storage.extension(name) IN ('jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'))
);

-- =====================================================
-- 3. POLÍTICA DE ACTUALIZACIÓN AUTENTICADA
-- =====================================================
-- Permite a usuarios autenticados actualizar sus propias imágenes
-- (opcional, pero útil para reemplazar imágenes)

CREATE POLICY "Authenticated users can update payment images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'payment-images' 
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- 4. POLÍTICA DE ELIMINACIÓN AUTENTICADA
-- =====================================================
-- Permite a usuarios autenticados eliminar imágenes de pagos
-- Útil para cuando se elimina un pago o se reemplaza la imagen

CREATE POLICY "Authenticated users can delete payment images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'payment-images' 
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- 5. CONFIGURACIÓN ADICIONAL DEL BUCKET
-- =====================================================
-- Asegurar que el bucket esté configurado correctamente

-- Verificar que el bucket existe y está configurado
-- (Esto es solo informativo, el bucket ya debería existir)
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'payment-images';

-- =====================================================
-- 6. POLÍTICAS ALTERNATIVAS (MÁS RESTRICTIVAS)
-- =====================================================
-- Si prefieres políticas más restrictivas, puedes usar estas en su lugar:

-- Opción A: Solo usuarios autenticados pueden leer
-- CREATE POLICY "Authenticated read access for payment images" ON storage.objects
-- FOR SELECT USING (
--   bucket_id = 'payment-images' 
--   AND auth.role() = 'authenticated'
-- );

-- Opción B: Solo administradores pueden eliminar
-- CREATE POLICY "Admins can delete payment images" ON storage.objects
-- FOR DELETE USING (
--   bucket_id = 'payment-images' 
--   AND auth.role() = 'authenticated'
--   AND EXISTS (
--     SELECT 1 FROM auth.users 
--     WHERE id = auth.uid() 
--     AND raw_user_meta_data->>'role' = 'admin'
--   )
-- );

-- =====================================================
-- 7. VERIFICACIÓN DE POLÍTICAS
-- =====================================================
-- Ejecutar esto después de crear las políticas para verificar que están activas

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%payment%'
ORDER BY policyname;

-- =====================================================
-- 8. CONFIGURACIÓN DE LÍMITES (OPCIONAL)
-- =====================================================
-- Si quieres configurar límites específicos para el bucket

-- Actualizar límites del bucket (ejemplo: máximo 10MB por archivo)
-- UPDATE storage.buckets 
-- SET file_size_limit = 10485760  -- 10MB en bytes
-- WHERE name = 'payment-images';

-- Configurar tipos MIME permitidos
-- UPDATE storage.buckets 
-- SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']
-- WHERE name = 'payment-images';

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. Las políticas se aplican inmediatamente después de ejecutar el SQL
-- 2. Si tienes problemas, verifica que el bucket 'payment-images' existe
-- 3. Las políticas de lectura pública son necesarias para mostrar imágenes en la web
-- 4. Puedes ajustar las políticas según tus necesidades de seguridad
-- 5. Recomendado: probar la subida de una imagen después de aplicar las políticas
