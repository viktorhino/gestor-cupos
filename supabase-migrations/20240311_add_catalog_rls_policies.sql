-- Habilitar RLS en las tablas de catálogo
ALTER TABLE card_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_special_finishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flyer_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_lists ENABLE ROW LEVEL SECURITY;

-- Políticas para CARD_REFERENCES
CREATE POLICY "Usuarios autenticados pueden ver referencias de tarjetas" ON card_references
  FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para CARD_SPECIAL_FINISHES
CREATE POLICY "Usuarios autenticados pueden ver terminaciones especiales" ON card_special_finishes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para FLYER_TYPES
CREATE POLICY "Usuarios autenticados pueden ver tipos de volantes" ON flyer_types
  FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para PRICE_LISTS
CREATE POLICY "Usuarios autenticados pueden ver listas de precios" ON price_lists
  FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas de modificación (solo admin)
CREATE POLICY "Solo admin puede modificar referencias de tarjetas" ON card_references
  FOR ALL USING (has_role('admin'));

CREATE POLICY "Solo admin puede modificar terminaciones especiales" ON card_special_finishes
  FOR ALL USING (has_role('admin'));

CREATE POLICY "Solo admin puede modificar tipos de volantes" ON flyer_types
  FOR ALL USING (has_role('admin'));

CREATE POLICY "Solo admin puede modificar listas de precios" ON price_lists
  FOR ALL USING (has_role('admin'));
