-- ==========================================================
-- LIBRETA DIGITAL DE CONSUMOS DE EMPLEADOS
-- Esquema Relacional para PostgreSQL
-- Estructura: Empleado -> Hoja Diaria -> Movimientos
-- ==========================================================

-- 1. Tabla de Empleados
CREATE TABLE IF NOT EXISTS empleados (
    id VARCHAR(64) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    dia_inicio_semana VARCHAR(15) NOT NULL DEFAULT 'lunes', -- 'lunes', 'martes', etc.
    color VARCHAR(30) DEFAULT '#D97706',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Hojas Diarias (Una hoja por cada día)
CREATE TABLE IF NOT EXISTS hojas_diarias (
    fecha DATE PRIMARY KEY, -- 'YYYY-MM-DD'
    fecha_formateada VARCHAR(100),
    cerrada BOOLEAN NOT NULL DEFAULT FALSE,
    fue_modificada_posteriormente BOOLEAN NOT NULL DEFAULT FALSE,
    nota_auditoria TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP WITH TIME ZONE
);

-- 3. Tabla de Movimientos / Consumos individuales
CREATE TABLE IF NOT EXISTS movimientos (
    id VARCHAR(64) PRIMARY KEY,
    empleado_id VARCHAR(64) NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    empleado_nombre VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL, -- Fecha del consumo
    hoja_fecha DATE NOT NULL REFERENCES hojas_diarias(fecha) ON DELETE CASCADE,
    hora VARCHAR(8) NOT NULL, -- 'HH:mm'
    concepto VARCHAR(150) NOT NULL,
    importe NUMERIC(10, 2) NOT NULL CHECK (importe > 0),
    es_modificacion_posterior BOOLEAN NOT NULL DEFAULT FALSE,
    nota_auditoria TEXT,
    registrado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP WITH TIME ZONE
);

-- 4. Tabla de Conceptos Rápidos / Precios predefinidos
CREATE TABLE IF NOT EXISTS conceptos_rapidos (
    id VARCHAR(64) PRIMARY KEY,
    concepto VARCHAR(100) NOT NULL,
    importe NUMERIC(10, 2) NOT NULL,
    icono VARCHAR(20) DEFAULT '🍺',
    orden INT DEFAULT 0
);

-- Índices para consultas ultra rápidas
CREATE INDEX IF NOT EXISTS idx_movimientos_hoja ON movimientos(hoja_fecha);
CREATE INDEX IF NOT EXISTS idx_movimientos_empleado ON movimientos(empleado_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos(fecha);

-- Vista para consultar el total diario por empleado
CREATE OR REPLACE VIEW vista_totales_diarios AS
SELECT 
    m.hoja_fecha,
    m.empleado_id,
    e.nombre AS empleado_nombre,
    COUNT(m.id) AS total_consumos,
    COALESCE(SUM(m.importe), 0) AS total_dia
FROM movimientos m
JOIN empleados e ON m.empleado_id = e.id
GROUP BY m.hoja_fecha, m.empleado_id, e.nombre;
