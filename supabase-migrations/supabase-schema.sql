-- T&V Cupos Management System Database Schema
-- This file contains the complete database schema for the cupos management system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE job_status AS ENUM (
  'recibido',
  'en_preprensa', 
  'pendiente_de_montaje',
  'en_cupo',
  'impreso',
  'terminado',
  'listo_para_entrega',
  'entregado'
);

CREATE TYPE job_type AS ENUM ('tarjetas', 'volantes');

CREATE TYPE card_group AS ENUM ('brillo', 'mate_reserva');

CREATE TYPE flyer_size AS ENUM ('media', 'cuarto', 'mini');

CREATE TYPE flyer_mode AS ENUM ('4x0', '4x1', '4x4');

CREATE TYPE special_finish_type AS ENUM (
  'perforacion',
  'despuntadas', 
  'estampado',
  'repujado',
  'troquelado'
);

CREATE TYPE payment_method AS ENUM ('efectivo', 'transferencia', 'cheque', 'tarjeta');

CREATE TYPE user_role AS ENUM ('admin', 'operario', 'entregas', 'comercial');

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  encargado VARCHAR(255),
  nit VARCHAR(50),
  whatsapp VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  direccion TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price lists table (versioned)
CREATE TABLE price_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  vigente_desde DATE NOT NULL,
  vigente_hasta DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Card references table
CREATE TABLE card_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  grupo card_group NOT NULL,
  precio_base_por_millar DECIMAL(10,2) NOT NULL,
  price_list_id UUID REFERENCES price_lists(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Card special finishes table
CREATE TABLE card_special_finishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre special_finish_type NOT NULL,
  precio_unit_por_millar DECIMAL(10,2) NOT NULL,
  metadata JSONB, -- For storing parameters like perforation type, position, etc.
  price_list_id UUID REFERENCES price_lists(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flyer types table
CREATE TABLE flyer_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tamaño flyer_size NOT NULL,
  modo flyer_mode NOT NULL,
  precio_base_por_millar DECIMAL(10,2) NOT NULL,
  price_list_id UUID REFERENCES price_lists(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tamaño, modo)
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consecutivo SERIAL UNIQUE,
  client_id UUID REFERENCES clients(id) NOT NULL,
  tipo job_type NOT NULL,
  nombre_trabajo VARCHAR(255),
  estado job_status DEFAULT 'recibido',
  fecha_recepcion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notas TEXT,
  total_estimado DECIMAL(12,2) DEFAULT 0,
  descuento DECIMAL(12,2) DEFAULT 0,
  saldo DECIMAL(12,2) DEFAULT 0,
  created_by UUID, -- Will reference users table
  imagen_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job items table
CREATE TABLE job_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  -- For cards
  card_reference_id UUID REFERENCES card_references(id),
  terminaciones_especiales JSONB, -- Array of special finishes with parameters
  -- For flyers
  flyer_type_id UUID REFERENCES flyer_types(id),
  -- Common fields
  ocupacion_cupo INTEGER NOT NULL DEFAULT 1,
  cantidad_millares INTEGER NOT NULL CHECK (cantidad_millares >= 1),
  observaciones TEXT,
  imagen_url TEXT,
  totales_calculados JSONB, -- Calculated totals breakdown
  estado job_status DEFAULT 'recibido',
  tercerizado BOOLEAN DEFAULT FALSE,
  proveedor_id UUID, -- Will reference suppliers table
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure either card or flyer is specified, but not both
  CHECK (
    (card_reference_id IS NOT NULL AND flyer_type_id IS NULL) OR
    (card_reference_id IS NULL AND flyer_type_id IS NOT NULL)
  )
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  metodo payment_method NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  observacion TEXT,
  created_by UUID, -- Will reference users table
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deliveries table
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  entregado_a VARCHAR(255),
  documento VARCHAR(50),
  saldo_al_momento DECIMAL(12,2) NOT NULL,
  receptor UUID, -- Will reference users table
  firma_url TEXT,
  comprobante_pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  contacto VARCHAR(255),
  whatsapp VARCHAR(20),
  email VARCHAR(255),
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplier services table
CREATE TABLE supplier_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE NOT NULL,
  servicio VARCHAR(100) NOT NULL,
  precio_base DECIMAL(10,2) NOT NULL,
  unidad VARCHAR(50) NOT NULL, -- por_millar, por_pliego, por_evento
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Batches (cupos) table
CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo job_type NOT NULL,
  fecha DATE NOT NULL,
  capacidad_teorica INTEGER,
  grupo VARCHAR(50), -- brillo, mate_reserva, mixto
  costos_resumen JSONB,
  estado VARCHAR(50) DEFAULT 'planificado', -- planificado, en_produccion, cerrado
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Batch items (cupo items) table
CREATE TABLE batch_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
  job_item_id UUID REFERENCES job_items(id) ON DELETE CASCADE NOT NULL,
  piezas_ocupadas INTEGER NOT NULL,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Costing table
CREATE TABLE costing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
  papel DECIMAL(10,2) DEFAULT 0,
  planchas DECIMAL(10,2) DEFAULT 0,
  impresion DECIMAL(10,2) DEFAULT 0,
  terminacion_basica DECIMAL(10,2) DEFAULT 0,
  terminacion_especial DECIMAL(10,2) DEFAULT 0,
  refilado DECIMAL(10,2) DEFAULT 0,
  otros DECIMAL(10,2) DEFAULT 0,
  total_costo DECIMAL(10,2) GENERATED ALWAYS AS (
    papel + planchas + impresion + terminacion_basica + 
    terminacion_especial + refilado + otros
  ) STORED,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (if not using Supabase auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  rol user_role DEFAULT 'operario',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entidad VARCHAR(100) NOT NULL,
  entidad_id UUID NOT NULL,
  accion VARCHAR(100) NOT NULL,
  before_data JSONB,
  after_data JSONB,
  user_id UUID REFERENCES users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_estado ON jobs(estado);
CREATE INDEX idx_jobs_fecha_recepcion ON jobs(fecha_recepcion);
CREATE INDEX idx_job_items_job_id ON job_items(job_id);
CREATE INDEX idx_job_items_estado ON job_items(estado);
CREATE INDEX idx_payments_job_id ON payments(job_id);
CREATE INDEX idx_deliveries_job_id ON deliveries(job_id);
CREATE INDEX idx_batch_items_batch_id ON batch_items(batch_id);
CREATE INDEX idx_batch_items_job_item_id ON batch_items(job_item_id);
CREATE INDEX idx_audit_logs_entidad ON audit_logs(entidad, entidad_id);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_items_updated_at BEFORE UPDATE ON job_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_costing_updated_at BEFORE UPDATE ON costing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to recalculate job totals
CREATE OR REPLACE FUNCTION recalculate_job_totals(job_uuid UUID)
RETURNS VOID AS $$
DECLARE
  total_amount DECIMAL(12,2);
  paid_amount DECIMAL(12,2);
BEGIN
  -- Calculate total from job items
  SELECT COALESCE(SUM(
    CASE 
      WHEN ji.card_reference_id IS NOT NULL THEN
        (cr.precio_base_por_millar + COALESCE(
          (SELECT SUM(
            CASE 
              WHEN (finish->>'precio') IS NOT NULL THEN (finish->>'precio')::DECIMAL
              ELSE 0
            END
          ) FROM jsonb_array_elements(ji.terminaciones_especiales) AS finish), 0
        )) * ji.ocupacion_cupo * ji.cantidad_millares
      WHEN ji.flyer_type_id IS NOT NULL THEN
        ft.precio_base_por_millar * ji.ocupacion_cupo * ji.cantidad_millares
      ELSE 0
    END
  ), 0)
  INTO total_amount
  FROM job_items ji
  LEFT JOIN card_references cr ON ji.card_reference_id = cr.id
  LEFT JOIN flyer_types ft ON ji.flyer_type_id = ft.id
  WHERE ji.job_id = job_uuid;

  -- Calculate paid amount
  SELECT COALESCE(SUM(monto), 0)
  INTO paid_amount
  FROM payments
  WHERE job_id = job_uuid;

  -- Update job totals
  UPDATE jobs 
  SET total_estimado = total_amount,
      saldo = total_amount - paid_amount,
      updated_at = NOW()
  WHERE id = job_uuid;
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate totals when job items change
CREATE OR REPLACE FUNCTION trigger_recalculate_job_totals()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM recalculate_job_totals(COALESCE(NEW.job_id, OLD.job_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_items_recalculate_totals
  AFTER INSERT OR UPDATE OR DELETE ON job_items
  FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_job_totals();

-- Trigger to recalculate totals when payments change
CREATE OR REPLACE FUNCTION trigger_recalculate_job_totals_payment()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM recalculate_job_totals(COALESCE(NEW.job_id, OLD.job_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payments_recalculate_totals
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_job_totals_payment();

-- Insert initial data
INSERT INTO price_lists (nombre, vigente_desde) VALUES ('Lista Base 2024', CURRENT_DATE);

-- Insert card references
INSERT INTO card_references (nombre, grupo, precio_base_por_millar, price_list_id) VALUES
  ('Brillo UV', 'brillo', 15000, (SELECT id FROM price_lists WHERE nombre = 'Lista Base 2024')),
  ('Mate 2L', 'mate_reserva', 12000, (SELECT id FROM price_lists WHERE nombre = 'Lista Base 2024')),
  ('Reserva 1L', 'mate_reserva', 10000, (SELECT id FROM price_lists WHERE nombre = 'Lista Base 2024')),
  ('Reserva 2L', 'mate_reserva', 11000, (SELECT id FROM price_lists WHERE nombre = 'Lista Base 2024'));

-- Insert special finishes
INSERT INTO card_special_finishes (nombre, precio_unit_por_millar, price_list_id) VALUES
  ('perforacion', 2000, (SELECT id FROM price_lists WHERE nombre = 'Lista Base 2024')),
  ('despuntadas', 1500, (SELECT id FROM price_lists WHERE nombre = 'Lista Base 2024')),
  ('estampado', 3000, (SELECT id FROM price_lists WHERE nombre = 'Lista Base 2024')),
  ('repujado', 4000, (SELECT id FROM price_lists WHERE nombre = 'Lista Base 2024')),
  ('troquelado', 5000, (SELECT id FROM price_lists WHERE nombre = 'Lista Base 2024'));

-- Insert flyer types
INSERT INTO flyer_types (tamaño, modo, precio_base_por_millar, price_list_id) VALUES
  ('media', '4x0', 8000, (SELECT id FROM price_lists WHERE nombre = 'Lista Base 2024')),
  ('media', '4x1', 10000, (SELECT id FROM price_lists WHERE nombre = 'Lista Base 2024')),
  ('media', '4x4', 12000, (SELECT id FROM price_lists WHERE nombre = 'Lista Base 2024')),
  ('cuarto', '4x0', 6000, (SELECT id FROM price_lists WHERE nombre = 'Lista Base 2024')),
  ('cuarto', '4x1', 7500, (SELECT id FROM price_lists WHERE nombre = 'Lista Base 2024')),
  ('cuarto', '4x4', 9000, (SELECT id FROM price_lists WHERE nombre = 'Lista Base 2024')),
  ('mini', '4x0', 4000, (SELECT id FROM price_lists WHERE nombre = 'Lista Base 2024')),
  ('mini', '4x1', 5000, (SELECT id FROM price_lists WHERE nombre = 'Lista Base 2024')),
  ('mini', '4x4', 6000, (SELECT id FROM price_lists WHERE nombre = 'Lista Base 2024'));

-- Insert sample client
INSERT INTO clients (nombre, nit, whatsapp, email) VALUES
  ('Cliente Demo', '12345678-9', '3001234567', 'demo@cliente.com');

-- Insert sample user
INSERT INTO users (nombre, email, rol) VALUES
  ('Administrador', 'admin@tnv.com', 'admin');
