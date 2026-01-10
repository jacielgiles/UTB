-- Procedimientos almacenados para BusTickets (PostgreSQL)

-- Función para buscar viajes disponibles
CREATE OR REPLACE FUNCTION BuscarViajes(
    p_ciudad_origen VARCHAR(100),
    p_ciudad_destino VARCHAR(100),
    p_fecha_viaje DATE
)
RETURNS TABLE (
    viaje_id INT,
    ciudad_origen VARCHAR(100),
    ciudad_destino VARCHAR(100),
    fecha_viaje DATE,
    hora_salida TIME,
    hora_llegada TIME,
    precio DECIMAL(10,2),
    numero_autobus VARCHAR(20),
    marca VARCHAR(50),
    modelo VARCHAR(50),
    tipo bus_type,
    capacidad_pasajeros INT,
    asientos_disponibles INT,
    amenidades JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vvd.viaje_id,
        vvd.ciudad_origen,
        vvd.ciudad_destino,
        vvd.fecha_viaje,
        vvd.hora_salida,
        vvd.hora_llegada,
        vvd.precio,
        vvd.numero_autobus,
        vvd.marca,
        vvd.modelo,
        vvd.tipo,
        vvd.capacidad_pasajeros,
        vvd.asientos_disponibles,
        vvd.amenidades
    FROM vista_viajes_disponibles vvd
    WHERE vvd.ciudad_origen ILIKE '%' || p_ciudad_origen || '%'
    AND vvd.ciudad_destino ILIKE '%' || p_ciudad_destino || '%'
    AND vvd.fecha_viaje = p_fecha_viaje
    ORDER BY vvd.hora_salida;
END;
$$;

-- Función para crear una reserva
CREATE OR REPLACE FUNCTION CrearReserva(
    p_user_id INT,
    p_viaje_id INT,
    p_numero_asiento INT,
    p_precio DECIMAL(10,2),
    OUT p_codigo_reserva VARCHAR(20),
    OUT p_resultado VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_asientos_disponibles INT;
    v_asiento_ocupado INT := 0;
    v_codigo VARCHAR(20);
BEGIN
    -- Verificar disponibilidad del viaje
    SELECT asientos_disponibles INTO v_asientos_disponibles
    FROM viajes 
    WHERE id = p_viaje_id AND estado = 'programado';
    
    IF v_asientos_disponibles IS NULL THEN
        p_resultado := 'ERROR: Viaje no encontrado o no disponible';
        p_codigo_reserva := NULL;
    ELSIF v_asientos_disponibles <= 0 THEN
        p_resultado := 'ERROR: No hay asientos disponibles';
        p_codigo_reserva := NULL;
    ELSE
        -- Verificar si el asiento ya está ocupado
        SELECT COUNT(*) INTO v_asiento_ocupado
        FROM reservas 
        WHERE viaje_id = p_viaje_id 
        AND numero_asiento = p_numero_asiento 
        AND estado IN ('reservado', 'pagado');
        
        IF v_asiento_ocupado > 0 THEN
            p_resultado := 'ERROR: Asiento ya ocupado';
            p_codigo_reserva := NULL;
        ELSE
            -- Generar código de reserva único
            v_codigo := 'BT' || EXTRACT(YEAR FROM NOW()) || EXTRACT(MONTH FROM NOW()) || EXTRACT(DAY FROM NOW()) || LPAD(p_viaje_id::TEXT, 4, '0') || LPAD(p_numero_asiento::TEXT, 2, '0');
            
            -- Crear la reserva
            INSERT INTO reservas (user_id, viaje_id, numero_asiento, precio_pagado, codigo_reserva, estado)
            VALUES (p_user_id, p_viaje_id, p_numero_asiento, p_precio, v_codigo, 'reservado');
            
            -- Actualizar asientos disponibles
            UPDATE viajes 
            SET asientos_disponibles = asientos_disponibles - 1
            WHERE id = p_viaje_id;
            
            p_codigo_reserva := v_codigo;
            p_resultado := 'SUCCESS: Reserva creada exitosamente';
        END IF;
    END IF;
END;
$$;

-- Función para procesar pago
CREATE OR REPLACE FUNCTION ProcesarPago(
    p_reserva_id INT,
    p_metodo_pago VARCHAR(50),
    p_transaction_id VARCHAR(100),
    OUT p_resultado VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_reserva_estado reservation_status;
    v_precio DECIMAL(10,2);
BEGIN
    -- Verificar estado de la reserva
    SELECT estado, precio_pagado INTO v_reserva_estado, v_precio
    FROM reservas 
    WHERE id = p_reserva_id;
    
    IF v_reserva_estado IS NULL THEN
        p_resultado := 'ERROR: Reserva no encontrada';
    ELSIF v_reserva_estado != 'reservado' THEN
        p_resultado := 'ERROR: Reserva no está en estado válido para pago';
    ELSE
        -- Actualizar reserva
        UPDATE reservas 
        SET estado = 'pagado',
            fecha_pago = NOW(),
            metodo_pago = p_metodo_pago::payment_method
        WHERE id = p_reserva_id;
        
        -- Registrar pago
        INSERT INTO pagos (reserva_id, monto, metodo_pago, estado, transaction_id, fecha_pago)
        VALUES (p_reserva_id, v_precio, p_metodo_pago, 'completado', p_transaction_id, NOW());
        
        p_resultado := 'SUCCESS: Pago procesado exitosamente';
    END IF;
END;
$$;

-- Función para cancelar reserva
CREATE OR REPLACE FUNCTION CancelarReserva(
    p_reserva_id INT,
    p_motivo TEXT,
    OUT p_resultado VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_viaje_id INT;
    v_fecha_viaje DATE;
    v_estado reservation_status;
    v_horas_diferencia INT;
BEGIN
    -- Obtener información de la reserva
    SELECT r.viaje_id, v.fecha_viaje, r.estado
    INTO v_viaje_id, v_fecha_viaje, v_estado
    FROM reservas r
    JOIN viajes v ON r.viaje_id = v.id
    WHERE r.id = p_reserva_id;
    
    IF v_viaje_id IS NULL THEN
        p_resultado := 'ERROR: Reserva no encontrada';
    ELSIF v_estado = 'cancelado' THEN
        p_resultado := 'ERROR: Reserva ya está cancelada';
    ELSIF v_estado = 'usado' THEN
        p_resultado := 'ERROR: No se puede cancelar una reserva ya utilizada';
    ELSE
        -- Calcular horas hasta el viaje
        v_horas_diferencia := EXTRACT(EPOCH FROM (v_fecha_viaje::TIMESTAMP - NOW())) / 3600;
        
        IF v_horas_diferencia < 24 THEN
            p_resultado := 'ERROR: No se puede cancelar con menos de 24 horas de anticipación';
        ELSE
            -- Cancelar reserva
            UPDATE reservas 
            SET estado = 'cancelado',
                notas = COALESCE(notas, '') || ' | Cancelado: ' || p_motivo
            WHERE id = p_reserva_id;
            
            -- Liberar asiento
            UPDATE viajes 
            SET asientos_disponibles = asientos_disponibles + 1
            WHERE id = v_viaje_id;
            
            p_resultado := 'SUCCESS: Reserva cancelada exitosamente';
        END IF;
    END IF;
END;
$$;