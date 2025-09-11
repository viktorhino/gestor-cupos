-- Habilitar RLS en la tabla clients
ALTER TABLE development.clients ENABLE ROW LEVEL SECURITY;

-- Políticas para CLIENTS
-- Lectura: cualquier usuario autenticado puede ver los clientes
CREATE POLICY "Usuarios autenticados pueden ver clientes" ON development.clients
  FOR SELECT USING (auth.role() = 'authenticated');

-- Inserción: cualquier usuario autenticado puede crear clientes
CREATE POLICY "Usuarios autenticados pueden crear clientes" ON development.clients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Actualización: cualquier usuario autenticado puede actualizar clientes
CREATE POLICY "Usuarios autenticados pueden actualizar clientes" ON development.clients
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Eliminación: solo admin puede eliminar clientes
CREATE POLICY "Solo admin puede eliminar clientes" ON development.clients
  FOR DELETE USING (auth.role() = 'service_role');
