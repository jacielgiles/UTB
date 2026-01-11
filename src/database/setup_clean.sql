-- Script para limpiar y recrear la tabla users
-- Ejecuta esto en tu consola de Neon

-- Eliminar tabla existente si hay problemas
DROP TABLE IF EXISTS users CASCADE;

-- Crear tabla de usuarios limpia
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    rol VARCHAR(20) DEFAULT 'cliente',
    email_verificado BOOLEAN DEFAULT FALSE,
    telefono_verificado BOOLEAN DEFAULT FALSE,
    acepta_newsletter BOOLEAN DEFAULT FALSE,
    ultimo_acceso TIMESTAMP NULL,
    intentos_login INT DEFAULT 0,
    bloqueado_hasta TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para optimización
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_telefono ON users(telefono);
CREATE INDEX idx_users_activo ON users(activo);
CREATE INDEX idx_users_fecha_registro ON users(fecha_registro);

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar timestamp en users
DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para validar edad mínima (18 años)
CREATE OR REPLACE FUNCTION validate_age()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.fecha_nacimiento > CURRENT_DATE - INTERVAL '18 years' THEN
        RAISE EXCEPTION 'El usuario debe ser mayor de 18 años para registrarse';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para validar edad
DROP TRIGGER IF EXISTS validate_user_age ON users;
CREATE TRIGGER validate_user_age
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION validate_age();

-- Función para bloquear usuario después de 5 intentos fallidos
CREATE OR REPLACE FUNCTION check_login_attempts()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.intentos_login >= 5 THEN
        NEW.bloqueado_hasta = CURRENT_TIMESTAMP + INTERVAL '30 minutes';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para bloqueo automático
DROP TRIGGER IF EXISTS check_user_login_attempts ON users;
CREATE TRIGGER check_user_login_attempts
    BEFORE UPDATE ON users
    FOR EACH ROW
    WHEN (NEW.intentos_login > OLD.intentos_login)
    EXECUTE FUNCTION check_login_attempts();

-- Insertar usuario de prueba con hash correcto
-- Contraseña: "test123" -> Hash: "bt_1a2b3c4d" (ejemplo)
INSERT INTO users (nombre, email, telefono, fecha_nacimiento, password_hash, acepta_newsletter) 
VALUES (
    'Usuario Prueba',
    'test@bustickets.com',
    '5512345678',
    '1990-01-01',
    'bt_1a2b3c4d',
    false
);

-- Verificar que todo funciona
SELECT 
    id, 
    nombre, 
    email, 
    password_hash,
    fecha_registro 
FROM users;

-- Mensaje de confirmación
SELECT 'Tabla users recreada exitosamente con hash consistente' AS resultado;