-- Agregar plantillas faltantes para estados de WhatsApp
-- Especialmente para "montado" y "delegado" que estaban mapeadas incorrectamente

-- Insertar plantilla para estado "montado"
INSERT INTO message_templates (name, estado_trigger, template_content, is_active) 
VALUES (
  'montado', 
  'montado', 
  'Hola {{tratamiento}}. 
Un saludito rápido para contarle que su trabajo {{nombre_trabajo}} ya está montado y acaba de entrar a la cola de producción. Le seguiremos informando. Saludos.',
  true
) ON CONFLICT (name) DO UPDATE SET
  template_content = EXCLUDED.template_content,
  estado_trigger = EXCLUDED.estado_trigger,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Insertar plantilla para estado "delegado"
INSERT INTO message_templates (name, estado_trigger, template_content, is_active) 
VALUES (
  'delegado', 
  'delegado', 
  'Hola {{tratamiento}}. 
Un saludito rápido para contarle que su trabajo {{nombre_trabajo}} ya está montado y acaba de entrar a la cola de producción. Le seguiremos informando. Saludos.',
  true
) ON CONFLICT (name) DO UPDATE SET
  template_content = EXCLUDED.template_content,
  estado_trigger = EXCLUDED.estado_trigger,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verificar que las plantillas se crearon correctamente
SELECT name, estado_trigger, is_active 
FROM message_templates 
WHERE name IN ('montado', 'delegado', 'recibido', 'impreso', 'empacado', 'entregado')
ORDER BY name;


