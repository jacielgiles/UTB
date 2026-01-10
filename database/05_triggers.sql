-- Triggers para BusTickets (PostgreSQL)

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar timestamp en users
CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar timestamp en reservas
CREATE TRIGGER reservas_updated_at
    BEFORE UPDATE ON reservas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar timestamp en configuracion
CREATE TRIGGER configuracion_updated_at
    BEFORE UPDATE ON configuracion
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para validar capacidad de asientos
CREATE OR REPLACE FUNCTION validar_numero_asiento()
RETURNS TRIGGER AS $$
DECLARE
    v_capacidad INT;
BEGIN
    SELECT a.capacidad_pasajeros INTO v_capacidad
    FROM viajes v
    JOIN horarios h ON v.horario_id = h.id
    JOIN autobuses a ON h.autobus_id = a.id
    WHERE v.id = NEW.viaje_id;
    
    IF NEW.numero_asiento > v_capacidad OR NEW.numero_asiento < 1 THEN
        RAISE EXCEPTION 'Número de asiento inválido para este autobús';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar capacidad de asientos en reservas
CREATE TRIGGER validar_numero_asiento_trigger
    BEFORE INSERT ON reservas
    FOR EACH ROW
    EXECUTE FUNCTION validar_numero_asiento();

-- Función para prevenir reservas duplicadas
CREATE OR REPLACE FUNCTION prevenir_asiento_duplicado()
RETURNS TRIGGER AS $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM reservas 
    WHERE viaje_id = NEW.viaje_id 
    AND numero_asiento = NEW.numero_asiento 
    AND estado IN ('reservado', 'pagado');
    
    IF v_count > 0 THEN
        RAISE EXCEPTION 'Este asiento ya está reservado para este viaje';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para prevenir reservas duplicadas del mismo asiento
CREATE TRIGGER prevenir_asiento_duplicado_trigger
    BEFORE INSERT ON reservas
    FOR EACH ROW
    EXECUTE FUNCTION prevenir_asiento_duplicado();

-- Función para generar código de reserva
CREATE OR REPLACE FUNCTION generar_codigo_reserva()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo_reserva IS NULL OR NEW.codigo_reserva = '' THEN
        NEW.codigo_reserva := 'BT' || 
                             EXTRACT(YEAR FROM NOW()) || 
                             LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0') ||
                             LPAD(EXTRACT(DAY FROM NOW())::TEXT, 2, '0') ||
                             LPAD(NEW.viaje_id::TEXT, 4, '0') ||
                             LPAD(NEW.numero_asiento::TEXT, 2, '0') ||
                             LPAD(FLOOR(RANDOM() * 100)::TEXT, 2, '0');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar código de reserva automáticamente
CREATE TRIGGER generar_codigo_reserva_trigger
    BEFORE INSERT ON reservas
    FOR EACH ROW
    EXECUTE FUNCTION generar_codigo_reserva();

-- Función para actualizar asientos disponibles al crear reserva
CREATE OR REPLACE FUNCTION actualizar_asientos_crear()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado IN ('reservado', 'pagado') THEN
        UPDATE viajes 
        SET asientos_disponibles = asientos_disponibles - 1
        WHERE id = NEW.viaje_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar asientos disponibles al crear reserva
CREATE TRIGGER actualizar_asientos_crear_trigger
    AFTER INSERT ON reservas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_asientos_crear();

-- Función para actualizar asientos al cambiar estado
CREATE OR REPLACE FUNCTION actualizar_asientos_cambio_estado()
RETURNS TRIGGER AS $$
BEGIN
    -- Si cambió de no-activo a activo
    IF OLD.estado IN ('cancelado') AND NEW.estado IN ('reservado', 'pagado') THEN
        UPDATE viajes 
        SET asientos_disponibles = asientos_disponibles - 1
        WHERE id = NEW.viaje_id;
    END IF;
    
    -- Si cambió de activo a no-activo
    IF OLD.estado IN ('reservado', 'pagado') AND NEW.estado IN ('cancelado') THEN
        UPDATE viajes 
        SET asientos_disponibles = asientos_disponibles + 1
        WHERE id = NEW.viaje_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar asientos disponibles al cambiar estado de reserva
CREATE TRIGGER actualizar_asientos_cambio_estado_trigger
    AFTER UPDATE ON reservas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_asientos_cambio_estado();

-- Función para validar fechas de viaje
CREATE OR REPLACE FUNCTION validar_fecha_viaje()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.fecha_viaje < CURRENT_DATE THEN
        RAISE EXCEPTION 'No se pueden crear viajes para fechas pasadas';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar fechas de viaje
CREATE TRIGGER validar_fecha_viaje_trigger
    BEFORE INSERT ON viajes
    FOR EACH ROW
    EXECUTE FUNCTION validar_fecha_viaje();

-- Función para validar precios positivos
CREATE OR REPLACE FUNCTION validar_precio_reserva()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.precio_pagado <= 0 THEN
        RAISE EXCEPTION 'El precio debe ser mayor a cero';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar precios positivos
CREATE TRIGGER validar_precio_reserva_trigger
    BEFORE INSERT ON reservas
    FOR EACH ROW
    EXECUTE FUNCTION validar_precio_reserva();

-- Función para log de cambios importantes
CREATE OR REPLACE FUNCTION log_cambios_reservas()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estado != NEW.estado THEN
        INSERT INTO logs_sistema (tabla, registro_id, accion, datos_anteriores, datos_nuevos, fecha)
        VALUES (
            'reservas',
            NEW.id,
            'cambio_estado_' || OLD.estado || '_a_' || NEW.estado,
            jsonb_build_object('estado', OLD.estado, 'fecha_pago', OLD.fecha_pago),
            jsonb_build_object('estado', NEW.estado, 'fecha_pago', NEW.fecha_pago),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para log de cambios importantes en reservas
CREATE TRIGGER log_cambios_reservas_trigger
    AFTER UPDATE ON reservas
    FOR EACH ROW
    EXECUTE FUNCTION log_cambios_reservas();