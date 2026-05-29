-- Esquema SQL para la base de datos de No+Cables

-- Tabla de usuarios -- La columna 'role' se utiliza para diferenciar permisos (ciudadanos vs. funcionarios)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('ciudadano', 'funcionario')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de reportes de problemas con cables -- 
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  street VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('baja', 'media', 'alta')),
  status VARCHAR(20) NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente', 'verificado', 'agendado', 'en_proceso', 'resuelto')),
  scheduled_date DATE,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla del historial de cambios de estado de los reportes --
CREATE TABLE IF NOT EXISTS report_status_history (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL
    CHECK (status IN ('pendiente', 'verificado', 'agendado', 'en_proceso', 'resuelto')),
  comment TEXT,
  changed_by_user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para optimizar consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_report_status_history_report_id
  ON report_status_history(report_id);

-- Función auxiliar para actualizar automáticamente la columna 'updated_at' en la tabla 'reports' cada vez que se actualice un registro
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reports_set_updated_at ON reports;

-- Si se detecta una actualización en la tabla 'reports', se ejecuta la función...
CREATE TRIGGER reports_set_updated_at
BEFORE UPDATE ON reports
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
