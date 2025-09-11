-- Sistema de seguimiento para clientes
-- Agregar campo tracking_token a la tabla jobs

-- Agregar columna tracking_token a la tabla jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS tracking_token VARCHAR(255) UNIQUE;

-- Crear tabla para historial de estados
CREATE TABLE IF NOT EXISTS job_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  estado_anterior VARCHAR(50),
  estado_nuevo VARCHAR(50) NOT NULL,
  fecha_cambio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsquedas por token
CREATE INDEX IF NOT EXISTS idx_jobs_tracking_token ON jobs(tracking_token);

-- Crear índice para historial de estados
CREATE INDEX IF NOT EXISTS idx_job_status_history_job_id ON job_status_history(job_id);

-- Función para generar token de seguimiento
CREATE OR REPLACE FUNCTION generate_tracking_token()
RETURNS TEXT AS $$
BEGIN
  RETURN 'TNV' || EXTRACT(EPOCH FROM NOW())::BIGINT || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar token automáticamente al crear un trabajo
CREATE OR REPLACE FUNCTION set_tracking_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_token IS NULL THEN
    NEW.tracking_token := generate_tracking_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS trigger_set_tracking_token ON jobs;
CREATE TRIGGER trigger_set_tracking_token
  BEFORE INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION set_tracking_token();

-- Función para registrar cambios de estado
CREATE OR REPLACE FUNCTION log_job_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo registrar si el estado cambió
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    INSERT INTO job_status_history (job_id, estado_anterior, estado_nuevo, observaciones)
    VALUES (NEW.id, OLD.estado, NEW.estado, 'Cambio de estado automático');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para historial de estados
DROP TRIGGER IF EXISTS trigger_log_job_status_change ON jobs;
CREATE TRIGGER trigger_log_job_status_change
  AFTER UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION log_job_status_change();

-- Política RLS para permitir acceso público a trabajos por token
CREATE POLICY "Public access by tracking token" ON jobs
  FOR SELECT USING (tracking_token IS NOT NULL);

-- Política RLS para historial de estados
CREATE POLICY "Public access to job status history" ON job_status_history
  FOR SELECT USING (true);

