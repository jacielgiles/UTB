-- Vistas útiles para BusTickets

-- Vista de rutas con nombres de ciudades
CREATE OR REPLACE VIEW vista_rutas AS
SELECT 
    r.id,
    co.nombre AS ciudad_origen,
    co.estado AS estado_origen,
    cd.nombre AS ciudad_destino,
    cd.estado AS estado_destino,
    r.distancia_km,
    r.duracion_estimada,
    r.precio_base,
    r.activo,
    r.created_at
FROM rutas r
JOIN ciudades co ON r.ciudad_origen_id = co.id
JOIN ciudades cd ON r.ciudad_destino_id = cd.id;

-- Vista de horarios completos
CREATE OR REPLACE VIEW vista_horarios AS
SELECT 
    h.id,
    vr.ciudad_origen,
    vr.ciudad_destino,
    h.hora_salida,
    h.hora_llegada,
    h.dias_semana,
    h.precio,
    a.numero_autobus,
    a.marca,
    a.modelo,
    a.tipo,
    a.capacidad_pasajeros,
    a.amenidades,
    h.activo
FROM horarios h
JOIN vista_rutas vr ON h.ruta_id = vr.id
JOIN autobuses a ON h.autobus_id = a.id;

-- Vista de viajes disponibles
CREATE OR REPLACE VIEW vista_viajes_disponibles AS
SELECT 
    v.id AS viaje_id,
    vh.ciudad_origen,
    vh.ciudad_destino,
    v.fecha_viaje,
    vh.hora_salida,
    vh.hora_llegada,
    vh.precio,
    vh.numero_autobus,
    vh.marca,
    vh.modelo,
    vh.tipo,
    vh.capacidad_pasajeros,
    v.asientos_disponibles,
    vh.amenidades,
    v.estado
FROM viajes v
JOIN vista_horarios vh ON v.horario_id = vh.id
WHERE v.estado = 'programado' 
AND v.fecha_viaje >= CURRENT_DATE
AND v.asientos_disponibles > 0;

-- Vista de reservas completas
CREATE OR REPLACE VIEW vista_reservas AS
SELECT 
    r.id,
    r.codigo_reserva,
    u.nombre AS cliente_nombre,
    u.email AS cliente_email,
    u.telefono AS cliente_telefono,
    vvd.ciudad_origen,
    vvd.ciudad_destino,
    vvd.fecha_viaje,
    vvd.hora_salida,
    vvd.hora_llegada,
    vvd.numero_autobus,
    r.numero_asiento,
    r.precio_pagado,
    r.estado,
    r.fecha_reserva,
    r.fecha_pago,
    r.metodo_pago,
    r.notas
FROM reservas r
JOIN users u ON r.user_id = u.id
JOIN vista_viajes_disponibles vvd ON r.viaje_id = vvd.viaje_id;

-- Vista de estadísticas de ventas
CREATE OR REPLACE VIEW vista_estadisticas_ventas AS
SELECT 
    DATE(r.fecha_reserva) AS fecha,
    COUNT(*) AS total_reservas,
    COUNT(CASE WHEN r.estado = 'pagado' THEN 1 END) AS reservas_pagadas,
    SUM(CASE WHEN r.estado = 'pagado' THEN r.precio_pagado ELSE 0 END) AS ingresos_dia,
    AVG(CASE WHEN r.estado = 'pagado' THEN r.precio_pagado ELSE NULL END) AS precio_promedio
FROM reservas r
GROUP BY DATE(r.fecha_reserva)
ORDER BY fecha DESC;

-- Vista de ocupación por viaje
CREATE OR REPLACE VIEW vista_ocupacion_viajes AS
SELECT 
    v.id AS viaje_id,
    vvd.ciudad_origen,
    vvd.ciudad_destino,
    vvd.fecha_viaje,
    vvd.hora_salida,
    vvd.capacidad_pasajeros,
    v.asientos_disponibles,
    (vvd.capacidad_pasajeros - v.asientos_disponibles) AS asientos_ocupados,
    ROUND(((vvd.capacidad_pasajeros - v.asientos_disponibles) * 100.0 / vvd.capacidad_pasajeros), 2) AS porcentaje_ocupacion
FROM viajes v
JOIN vista_viajes_disponibles vvd ON v.id = vvd.viaje_id;

-- Vista de rutas más populares
CREATE OR REPLACE VIEW vista_rutas_populares AS
SELECT 
    vr.ciudad_origen,
    vr.ciudad_destino,
    COUNT(r.id) AS total_reservas,
    SUM(CASE WHEN r.estado = 'pagado' THEN r.precio_pagado ELSE 0 END) AS ingresos_total,
    AVG(CASE WHEN r.estado = 'pagado' THEN r.precio_pagado ELSE NULL END) AS precio_promedio
FROM vista_reservas vr
JOIN reservas r ON vr.id = r.id
GROUP BY vr.ciudad_origen, vr.ciudad_destino
ORDER BY total_reservas DESC;

-- Vista de usuarios activos
CREATE OR REPLACE VIEW vista_usuarios_activos AS
SELECT 
    u.id,
    u.nombre,
    u.email,
    u.telefono,
    u.fecha_registro,
    COUNT(r.id) AS total_reservas,
    COUNT(CASE WHEN r.estado = 'pagado' THEN 1 END) AS reservas_pagadas,
    SUM(CASE WHEN r.estado = 'pagado' THEN r.precio_pagado ELSE 0 END) AS total_gastado,
    MAX(r.fecha_reserva) AS ultima_reserva
FROM users u
LEFT JOIN reservas r ON u.id = r.user_id
WHERE u.activo = TRUE
GROUP BY u.id, u.nombre, u.email, u.telefono, u.fecha_registro
ORDER BY total_reservas DESC;