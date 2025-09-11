-- Políticas RLS para el sistema de autenticación y roles
-- Este archivo contiene las políticas de Row Level Security para controlar el acceso basado en roles

-- Habilitar RLS en las tablas principales
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE costing ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT rol 
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario tiene un rol específico
CREATE OR REPLACE FUNCTION has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = required_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario tiene alguno de los roles especificados
CREATE OR REPLACE FUNCTION has_any_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = ANY(required_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para la tabla USERS
-- Solo los administradores pueden ver todos los usuarios
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (has_role('admin'));

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Solo los administradores pueden insertar usuarios
CREATE POLICY "Admins can insert users" ON users
  FOR INSERT WITH CHECK (has_role('admin'));

-- Solo los administradores pueden actualizar usuarios
CREATE POLICY "Admins can update users" ON users
  FOR UPDATE USING (has_role('admin'));

-- Solo los administradores pueden eliminar usuarios
CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (has_role('admin'));

-- Políticas para la tabla CLIENTS
-- Todos los usuarios autenticados pueden ver clientes
CREATE POLICY "Authenticated users can view clients" ON clients
  FOR SELECT USING (auth.role() = 'authenticated');

-- Solo comerciales y administradores pueden insertar clientes
CREATE POLICY "Commercial and admin can insert clients" ON clients
  FOR INSERT WITH CHECK (has_any_role(ARRAY['comercial', 'admin']));

-- Solo comerciales y administradores pueden actualizar clientes
CREATE POLICY "Commercial and admin can update clients" ON clients
  FOR UPDATE USING (has_any_role(ARRAY['comercial', 'admin']));

-- Solo administradores pueden eliminar clientes
CREATE POLICY "Admins can delete clients" ON clients
  FOR DELETE USING (has_role('admin'));

-- Políticas para la tabla JOBS
-- Todos los usuarios autenticados pueden ver trabajos
CREATE POLICY "Authenticated users can view jobs" ON jobs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Operarios, comerciales y administradores pueden insertar trabajos
CREATE POLICY "Operarios, commercial and admin can insert jobs" ON jobs
  FOR INSERT WITH CHECK (has_any_role(ARRAY['operario', 'comercial', 'admin']));

-- Operarios, comerciales y administradores pueden actualizar trabajos
CREATE POLICY "Operarios, commercial and admin can update jobs" ON jobs
  FOR UPDATE USING (has_any_role(ARRAY['operario', 'comercial', 'admin']));

-- Solo administradores pueden eliminar trabajos
CREATE POLICY "Admins can delete jobs" ON jobs
  FOR DELETE USING (has_role('admin'));

-- Políticas para la tabla BATCHES
-- Todos los usuarios autenticados pueden ver lotes
CREATE POLICY "Authenticated users can view batches" ON batches
  FOR SELECT USING (auth.role() = 'authenticated');

-- Solo operarios y administradores pueden insertar lotes
CREATE POLICY "Operarios and admin can insert batches" ON batches
  FOR INSERT WITH CHECK (has_any_role(ARRAY['operario', 'admin']));

-- Solo operarios y administradores pueden actualizar lotes
CREATE POLICY "Operarios and admin can update batches" ON batches
  FOR UPDATE USING (has_any_role(ARRAY['operario', 'admin']));

-- Solo administradores pueden eliminar lotes
CREATE POLICY "Admins can delete batches" ON batches
  FOR DELETE USING (has_role('admin'));

-- Políticas para la tabla PAYMENTS
-- Todos los usuarios autenticados pueden ver pagos
CREATE POLICY "Authenticated users can view payments" ON payments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Operarios, comerciales y administradores pueden insertar pagos
CREATE POLICY "Operarios, commercial and admin can insert payments" ON payments
  FOR INSERT WITH CHECK (has_any_role(ARRAY['operario', 'comercial', 'admin']));

-- Operarios, comerciales y administradores pueden actualizar pagos
CREATE POLICY "Operarios, commercial and admin can update payments" ON payments
  FOR UPDATE USING (has_any_role(ARRAY['operario', 'comercial', 'admin']));

-- Solo administradores pueden eliminar pagos
CREATE POLICY "Admins can delete payments" ON payments
  FOR DELETE USING (has_role('admin'));

-- Políticas para la tabla COSTING
-- Solo operarios y administradores pueden ver costos
CREATE POLICY "Operarios and admin can view costing" ON costing
  FOR SELECT USING (has_any_role(ARRAY['operario', 'admin']));

-- Solo operarios y administradores pueden insertar costos
CREATE POLICY "Operarios and admin can insert costing" ON costing
  FOR INSERT WITH CHECK (has_any_role(ARRAY['operario', 'admin']));

-- Solo operarios y administradores pueden actualizar costos
CREATE POLICY "Operarios and admin can update costing" ON costing
  FOR UPDATE USING (has_any_role(ARRAY['operario', 'admin']));

-- Solo administradores pueden eliminar costos
CREATE POLICY "Admins can delete costing" ON costing
  FOR DELETE USING (has_role('admin'));

-- Políticas para la tabla MESSAGE_TEMPLATES
-- Todos los usuarios autenticados pueden ver plantillas de mensajes
CREATE POLICY "Authenticated users can view message templates" ON message_templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Solo administradores pueden insertar plantillas
CREATE POLICY "Admins can insert message templates" ON message_templates
  FOR INSERT WITH CHECK (has_role('admin'));

-- Solo administradores pueden actualizar plantillas
CREATE POLICY "Admins can update message templates" ON message_templates
  FOR UPDATE USING (has_role('admin'));

-- Solo administradores pueden eliminar plantillas
CREATE POLICY "Admins can delete message templates" ON message_templates
  FOR DELETE USING (has_role('admin'));

-- Políticas para la tabla AUDIT_LOG
-- Solo administradores pueden ver el log de auditoría
CREATE POLICY "Admins can view audit log" ON audit_log
  FOR SELECT USING (has_role('admin'));

-- Solo el sistema puede insertar en el log de auditoría
CREATE POLICY "System can insert audit log" ON audit_log
  FOR INSERT WITH CHECK (true);

-- Crear índices para mejorar el rendimiento de las consultas RLS
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
CREATE INDEX IF NOT EXISTS idx_users_rol ON users(rol);
CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_batches_created_by ON batches(created_by);
CREATE INDEX IF NOT EXISTS idx_payments_created_by ON payments(created_by);

