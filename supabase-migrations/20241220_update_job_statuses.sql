-- Migración para actualizar estados de trabajos y agregar sistema de mensajes WhatsApp
-- Fecha: 2024-12-20

-- 1. Actualizar el enum de estados de trabajos
-- Primero eliminamos los constraints existentes
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_estado_check;
ALTER TABLE job_items DROP CONSTRAINT IF EXISTS job_items_estado_check;

-- Eliminamos los valores por defecto temporalmente
ALTER TABLE jobs ALTER COLUMN estado DROP DEFAULT;
ALTER TABLE job_items ALTER COLUMN estado DROP DEFAULT;

-- Convertimos las columnas a TEXT para poder manejar los nuevos valores
ALTER TABLE jobs ALTER COLUMN estado TYPE TEXT USING estado::text;
ALTER TABLE job_items ALTER COLUMN estado TYPE TEXT USING estado::text;

-- Mapeamos los valores antiguos a los nuevos en la tabla jobs
UPDATE jobs SET estado = CASE 
  WHEN estado = 'recibido' THEN 'recibido'
  WHEN estado = 'en_preprensa' THEN 'procesando'
  WHEN estado = 'pendiente_de_montaje' THEN 'finalizado'
  WHEN estado = 'en_cupo' THEN 'montado'
  WHEN estado = 'impreso' THEN 'impreso'
  WHEN estado = 'terminado' THEN 'empacado'
  WHEN estado = 'listo_para_entrega' THEN 'empacado'
  WHEN estado = 'entregado' THEN 'entregado'
  WHEN estado = 'cancelado' THEN 'entregado' -- Mapear cancelados como entregados
  ELSE 'recibido' -- Valor por defecto para cualquier estado no reconocido
END;

-- Mapeamos los valores antiguos a los nuevos en la tabla job_items
UPDATE job_items SET estado = CASE 
  WHEN estado = 'recibido' THEN 'recibido'
  WHEN estado = 'en_preprensa' THEN 'procesando'
  WHEN estado = 'pendiente_de_montaje' THEN 'finalizado'
  WHEN estado = 'en_cupo' THEN 'montado'
  WHEN estado = 'impreso' THEN 'impreso'
  WHEN estado = 'terminado' THEN 'empacado'
  WHEN estado = 'listo_para_entrega' THEN 'empacado'
  WHEN estado = 'entregado' THEN 'entregado'
  WHEN estado = 'cancelado' THEN 'entregado' -- Mapear cancelados como entregados
  ELSE 'recibido' -- Valor por defecto para cualquier estado no reconocido
END;

-- Creamos el nuevo enum con los estados actualizados
CREATE TYPE job_status_new AS ENUM (
  'recibido',
  'procesando', 
  'finalizado',
  'montado',
  'delegado',
  'impreso',
  'empacado',
  'entregado'
);

-- Actualizamos las columnas estado para usar el nuevo enum
ALTER TABLE jobs ALTER COLUMN estado TYPE job_status_new USING estado::job_status_new;
ALTER TABLE job_items ALTER COLUMN estado TYPE job_status_new USING estado::job_status_new;

-- Establecemos nuevos valores por defecto
ALTER TABLE jobs ALTER COLUMN estado SET DEFAULT 'recibido'::job_status_new;
ALTER TABLE job_items ALTER COLUMN estado SET DEFAULT 'recibido'::job_status_new;

-- Eliminamos el enum viejo
DROP TYPE IF EXISTS job_status;

-- Renombramos el nuevo enum
ALTER TYPE job_status_new RENAME TO job_status;

-- 2. Crear tabla para historial de mensajes WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  estado_trigger VARCHAR(50) NOT NULL, -- Estado que disparó el mensaje
  template_name VARCHAR(100) NOT NULL, -- Nombre de la plantilla usada
  message_content TEXT NOT NULL, -- Contenido del mensaje generado
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_by UUID REFERENCES users(id),
  is_copied BOOLEAN DEFAULT FALSE, -- Si el mensaje fue copiado al portapapeles
  copied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_job_id ON whatsapp_messages(job_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_estado_trigger ON whatsapp_messages(estado_trigger);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_sent_at ON whatsapp_messages(sent_at);

-- 4. Crear tabla para plantillas de mensajes (opcional, para futuras personalizaciones)
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  estado_trigger VARCHAR(50) NOT NULL,
  template_content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Insertar plantillas por defecto (usando ON CONFLICT para evitar duplicados)
INSERT INTO message_templates (name, estado_trigger, template_content) VALUES
('recibido', 'recibido', 'Hola {{nombre}}, cordial saludo. Recibimos su trabajo {{nombre_trabajo}} para producir con las siguientes especificaciones: 
- {{tipo_trabajo}} {{terminacion_tamaño_tintas}}
- {{millares}}
- {{terminaciones_especiales}}
- {{observaciones}}
Adjuntamos imagen de lo que recibimos para que por favor nos valide que esté correcta {{imagen_trabajo}}

A través de este medio le estaremos informando los avances que vayamos teniendo con su trabajo. Gracias por confiar en nosotros'),

('montado_delegado', 'montado', 'Hola {{nombre}}. 
Un saludito rápido para contarle que su trabajo {{nombre_trabajo}} ya está montado y acaba de entrar a la cola de producción. Le seguiremos informando. Saludos.'),

('impreso', 'impreso', 'Hola {{nombre}}. 
Sólo para avisarle que su trabajo {{nombre_trabajo}} ya está impreso. SÓLO FALTAN LAS TERMINACIONES y estamos en eso así que apenas esté listo por completo le avisaremos.'),

('empacado', 'empacado', 'Hola de nuevo {{nombre}}. 
Buenísimas noticias!!. Ya su trabajo {{nombre_trabajo}} está listo para que lo recoja o envíe por él. 
Recuerde que nuestro horario es de 8:30am a 12:30m y de 1:30pm a 5:30pm (lo sábados sólo hasta las 2:00pm).

Por aquí lo esperamos!!. 

PD: sólo a manera de información, actualmente el saldo pendiente por este trabajo es de {{saldo_pendiente}}.'),

('entregado', 'entregado', 'Cordial saludo, {{nombre}}. 
Su trabajo {{nombre_trabajo}} fue entregado con éxito.
Para nosotros siempre será un placer servirle.')
ON CONFLICT (name) DO UPDATE SET
  estado_trigger = EXCLUDED.estado_trigger,
  template_content = EXCLUDED.template_content,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 6. Crear función para actualizar updated_at en message_templates
CREATE OR REPLACE FUNCTION update_message_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear trigger para updated_at
CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON message_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_message_templates_updated_at();

-- 8. Configurar RLS para las nuevas tablas
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- 9. Crear políticas RLS (permitir todo por ahora, ajustar según necesidades de seguridad)
CREATE POLICY "Allow all operations on whatsapp_messages" ON whatsapp_messages
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on message_templates" ON message_templates
  FOR ALL USING (true);

-- 10. Comentarios para documentación
COMMENT ON TABLE whatsapp_messages IS 'Historial de mensajes WhatsApp enviados a clientes';
COMMENT ON TABLE message_templates IS 'Plantillas de mensajes WhatsApp por estado';
COMMENT ON COLUMN whatsapp_messages.estado_trigger IS 'Estado del trabajo que disparó el mensaje';
COMMENT ON COLUMN whatsapp_messages.is_copied IS 'Indica si el mensaje fue copiado al portapapeles';
COMMENT ON COLUMN whatsapp_messages.copied_at IS 'Timestamp cuando se copió el mensaje';
