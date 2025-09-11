-- Políticas RLS para las tablas de WhatsApp
-- Ejecutar en Supabase SQL Editor

-- 1. Habilitar RLS en las tablas (si no está habilitado)
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para whatsapp_messages
-- Permitir lectura de todos los mensajes
CREATE POLICY "Permitir lectura de mensajes WhatsApp" ON whatsapp_messages
    FOR SELECT USING (true);

-- Permitir inserción de nuevos mensajes
CREATE POLICY "Permitir inserción de mensajes WhatsApp" ON whatsapp_messages
    FOR INSERT WITH CHECK (true);

-- Permitir actualización de mensajes (para marcar como copiado)
CREATE POLICY "Permitir actualización de mensajes WhatsApp" ON whatsapp_messages
    FOR UPDATE USING (true);

-- 3. Políticas para message_templates
-- Permitir lectura de todas las plantillas
CREATE POLICY "Permitir lectura de plantillas" ON message_templates
    FOR SELECT USING (true);

-- Permitir inserción de nuevas plantillas
CREATE POLICY "Permitir inserción de plantillas" ON message_templates
    FOR INSERT WITH CHECK (true);

-- Permitir actualización de plantillas
CREATE POLICY "Permitir actualización de plantillas" ON message_templates
    FOR UPDATE USING (true);

-- 4. Verificar que las políticas se crearon correctamente
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
WHERE tablename IN ('whatsapp_messages', 'message_templates')
ORDER BY tablename, policyname;
