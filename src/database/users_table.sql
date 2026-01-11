-- Tabla de usuarios para BusTickets
-- PostgreSQL (Neon Database)

-- Crear tipo ENUM para roles de usuario (solo si no existe)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('cliente', 'admin', 'operador');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Eliminar tabla si existe para recrearla
DROP TABLE IF EXISTS users CASCADE;

-- Crear tabla de usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    rol user_role DEFAULT 'cliente',
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
CREATE INDEX idx_users_rol ON users(rol);
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

-- Comentarios en la tabla
COMMENT ON TABLE users IS 'Tabla de usuarios del sistema BusTickets';
COMMENT ON COLUMN users.id IS 'ID único del usuario';
COMMENT ON COLUMN users.nombre IS 'Nombre completo del usuario';
COMMENT ON COLUMN users.email IS 'Email único del usuario';
COMMENT ON COLUMN users.telefono IS 'Número de teléfono del usuario (10 dígitos)';
COMMENT ON COLUMN users.fecha_nacimiento IS 'Fecha de nacimiento (debe ser mayor de 18 años)';
COMMENT ON COLUMN users.password_hash IS 'Hash de la contraseña del usuario';
COMMENT ON COLUMN users.fecha_registro IS 'Fecha de registro del usuario';
COMMENT ON COLUMN users.activo IS 'Estado activo/inactivo del usuario';
COMMENT ON COLUMN users.rol IS 'Rol del usuario: cliente, admin, operador';
COMMENT ON COLUMN users.email_verificado IS 'Si el email ha sido verificado';
COMMENT ON COLUMN users.telefono_verificado IS 'Si el teléfono ha sido verificado';
COMMENT ON COLUMN users.acepta_newsletter IS 'Si acepta recibir newsletter';
COMMENT ON COLUMN users.ultimo_acceso IS 'Fecha del último acceso';
COMMENT ON COLUMN users.intentos_login IS 'Número de intentos de login fallidos';
COMMENT ON COLUMN users.bloqueado_hasta IS 'Fecha hasta la cual está bloqueado el usuario';
COMMENT ON COLUMN users.created_at IS 'Fecha de creación del registro';
COMMENT ON COLUMN users.updated_at IS 'Fecha de última actualización del registro';

-- Mensaje de confirmación
SELECT 'Tabla users creada exitosamente' AS resultado;