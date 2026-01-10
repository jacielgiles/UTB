-- Crear base de datos para BusTickets
-- PostgreSQL compatible

-- Crear tipos ENUM para PostgreSQL
CREATE TYPE user_role AS ENUM ('cliente', 'admin', 'operador');
CREATE TYPE bus_type AS ENUM ('ejecutivo', 'primera_clase', 'economico');
CREATE TYPE reservation_status AS ENUM ('reservado', 'pagado', 'usado', 'cancelado');
CREATE TYPE trip_status AS ENUM ('programado', 'en_curso', 'completado', 'cancelado');
CREATE TYPE payment_status AS ENUM ('pendiente', 'completado', 'fallido', 'reembolsado');
CREATE TYPE payment_method AS ENUM ('efectivo', 'tarjeta', 'transferencia', 'paypal');
CREATE TYPE config_type AS ENUM ('string', 'number', 'boolean', 'json');

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    rol user_role DEFAULT 'cliente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de ciudades
CREATE TABLE IF NOT EXISTS ciudades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    estado VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(10),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de rutas
CREATE TABLE IF NOT EXISTS rutas (
    id SERIAL PRIMARY KEY,
    ciudad_origen_id INT NOT NULL,
    ciudad_destino_id INT NOT NULL,
    distancia_km DECIMAL(8,2),
    duracion_estimada TIME,
    precio_base DECIMAL(10,2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ciudad_origen_id) REFERENCES ciudades(id),
    FOREIGN KEY (ciudad_destino_id) REFERENCES ciudades(id)
);

-- Tabla de autobuses
CREATE TABLE IF NOT EXISTS autobuses (
    id SERIAL PRIMARY KEY,
    numero_autobus VARCHAR(20) UNIQUE NOT NULL,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    año INT,
    capacidad_pasajeros INT NOT NULL,
    tipo bus_type DEFAULT 'economico',
    amenidades JSONB,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de horarios
CREATE TABLE IF NOT EXISTS horarios (
    id SERIAL PRIMARY KEY,
    ruta_id INT NOT NULL,
    autobus_id INT NOT NULL,
    hora_salida TIME NOT NULL,
    hora_llegada TIME NOT NULL,
    dias_semana JSONB, -- ['lunes', 'martes', etc.]
    precio DECIMAL(10,2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ruta_id) REFERENCES rutas(id),
    FOREIGN KEY (autobus_id) REFERENCES autobuses(id)
);

-- Tabla de viajes (instancias específicas de horarios)
CREATE TABLE IF NOT EXISTS viajes (
    id SERIAL PRIMARY KEY,
    horario_id INT NOT NULL,
    fecha_viaje DATE NOT NULL,
    asientos_disponibles INT NOT NULL,
    estado trip_status DEFAULT 'programado',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (horario_id) REFERENCES horarios(id),
    UNIQUE (horario_id, fecha_viaje)
);

-- Tabla de reservas/boletos
CREATE TABLE IF NOT EXISTS reservas (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    viaje_id INT NOT NULL,
    numero_asiento INT NOT NULL,
    precio_pagado DECIMAL(10,2) NOT NULL,
    estado reservation_status DEFAULT 'reservado',
    codigo_reserva VARCHAR(20) UNIQUE NOT NULL,
    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_pago TIMESTAMP NULL,
    metodo_pago payment_method NULL,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (viaje_id) REFERENCES viajes(id),
    UNIQUE (viaje_id, numero_asiento)
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    reserva_id INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    estado payment_status DEFAULT 'pendiente',
    transaction_id VARCHAR(100),
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detalles JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reserva_id) REFERENCES reservas(id)
);

-- Tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS configuracion (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descripcion TEXT,
    tipo config_type DEFAULT 'string',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de logs del sistema
CREATE TABLE IF NOT EXISTS logs_sistema (
    id SERIAL PRIMARY KEY,
    tabla VARCHAR(50) NOT NULL,
    registro_id INT NOT NULL,
    accion VARCHAR(100) NOT NULL,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_reservas_user_id ON reservas(user_id);
CREATE INDEX IF NOT EXISTS idx_reservas_viaje_id ON reservas(viaje_id);
CREATE INDEX IF NOT EXISTS idx_reservas_codigo ON reservas(codigo_reserva);
CREATE INDEX IF NOT EXISTS idx_viajes_fecha ON viajes(fecha_viaje);
CREATE INDEX IF NOT EXISTS idx_horarios_ruta ON horarios(ruta_id);
CREATE INDEX IF NOT EXISTS idx_rutas_origen_destino ON rutas(ciudad_origen_id, ciudad_destino_id);
CREATE INDEX IF NOT EXISTS idx_logs_tabla_registro ON logs_sistema(tabla, registro_id);
CREATE INDEX IF NOT EXISTS idx_logs_fecha ON logs_sistema(fecha);