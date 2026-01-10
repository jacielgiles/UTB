-- Datos de ejemplo para BusTickets

-- Insertar ciudades principales de México
INSERT INTO ciudades (nombre, estado, codigo_postal) VALUES
('Ciudad de México', 'CDMX', '01000'),
('Guadalajara', 'Jalisco', '44100'),
('Monterrey', 'Nuevo León', '64000'),
('Puebla', 'Puebla', '72000'),
('Tijuana', 'Baja California', '22000'),
('León', 'Guanajuato', '37000'),
('Juárez', 'Chihuahua', '32000'),
('Zapopan', 'Jalisco', '45000'),
('Mérida', 'Yucatán', '97000'),
('San Luis Potosí', 'San Luis Potosí', '78000'),
('Aguascalientes', 'Aguascalientes', '20000'),
('Hermosillo', 'Sonora', '83000'),
('Saltillo', 'Coahuila', '25000'),
('Mexicali', 'Baja California', '21000'),
('Culiacán', 'Sinaloa', '80000'),
('Cancún', 'Quintana Roo', '77500'),
('Acapulco', 'Guerrero', '39300'),
('Veracruz', 'Veracruz', '91700'),
('Oaxaca', 'Oaxaca', '68000'),
('Chihuahua', 'Chihuahua', '31000');

-- Insertar rutas principales
INSERT INTO rutas (ciudad_origen_id, ciudad_destino_id, distancia_km, duracion_estimada, precio_base) VALUES
-- Desde Ciudad de México
(1, 2, 460, '06:30:00', 450.00), -- CDMX - Guadalajara
(1, 3, 920, '10:00:00', 850.00), -- CDMX - Monterrey
(1, 4, 130, '02:00:00', 180.00), -- CDMX - Puebla
(1, 6, 385, '05:30:00', 420.00), -- CDMX - León
(1, 9, 1550, '18:00:00', 1200.00), -- CDMX - Mérida
(1, 10, 420, '06:00:00', 380.00), -- CDMX - San Luis Potosí
(1, 17, 350, '05:00:00', 320.00), -- CDMX - Acapulco
(1, 18, 345, '05:30:00', 350.00), -- CDMX - Veracruz

-- Desde Guadalajara
(2, 1, 460, '06:30:00', 450.00), -- Guadalajara - CDMX
(2, 3, 750, '08:30:00', 680.00), -- Guadalajara - Monterrey
(2, 6, 220, '03:00:00', 250.00), -- Guadalajara - León
(2, 11, 230, '03:30:00', 280.00), -- Guadalajara - Aguascalientes
(2, 15, 630, '08:00:00', 580.00), -- Guadalajara - Culiacán

-- Desde Monterrey
(3, 1, 920, '10:00:00', 850.00), -- Monterrey - CDMX
(3, 2, 750, '08:30:00', 680.00), -- Monterrey - Guadalajara
(3, 7, 350, '04:30:00', 320.00), -- Monterrey - Juárez
(3, 13, 285, '03:30:00', 280.00), -- Monterrey - Saltillo
(3, 20, 380, '05:00:00', 350.00), -- Monterrey - Chihuahua

-- Rutas adicionales
(4, 1, 130, '02:00:00', 180.00), -- Puebla - CDMX
(5, 14, 180, '02:30:00', 220.00), -- Tijuana - Mexicali
(9, 16, 320, '04:30:00', 380.00), -- Mérida - Cancún
(6, 11, 120, '02:00:00', 150.00), -- León - Aguascalientes
(12, 15, 280, '04:00:00', 320.00); -- Hermosillo - Culiacán

-- Insertar autobuses
INSERT INTO autobuses (numero_autobus, marca, modelo, año, capacidad_pasajeros, tipo, amenidades) VALUES
('BT001', 'Mercedes-Benz', 'Sprinter', 2022, 45, 'ejecutivo', '{"wifi": true, "aire_acondicionado": true, "asientos_reclinables": true, "entretenimiento": true, "baño": true}'::jsonb),
('BT002', 'Volvo', '9700', 2021, 42, 'ejecutivo', '{"wifi": true, "aire_acondicionado": true, "asientos_reclinables": true, "entretenimiento": true, "baño": true}'::jsonb),
('BT003', 'Scania', 'Irizar', 2023, 48, 'primera_clase', '{"wifi": true, "aire_acondicionado": true, "asientos_reclinables": true, "baño": true}'::jsonb),
('BT004', 'Mercedes-Benz', 'OH1628', 2020, 50, 'primera_clase', '{"wifi": true, "aire_acondicionado": true, "asientos_reclinables": true, "baño": true}'::jsonb),
('BT005', 'Volvo', 'B12R', 2022, 52, 'economico', '{"aire_acondicionado": true, "asientos_reclinables": false}'::jsonb),
('BT006', 'Scania', 'K360', 2021, 55, 'economico', '{"aire_acondicionado": true, "asientos_reclinables": false}'::jsonb),
('BT007', 'Mercedes-Benz', 'Sprinter', 2023, 44, 'ejecutivo', '{"wifi": true, "aire_acondicionado": true, "asientos_reclinables": true, "entretenimiento": true, "baño": true}'::jsonb),
('BT008', 'Volvo', '9700', 2022, 46, 'primera_clase', '{"wifi": true, "aire_acondicionado": true, "asientos_reclinables": true, "baño": true}'::jsonb),
('BT009', 'Scania', 'Irizar', 2021, 50, 'economico', '{"aire_acondicionado": true, "asientos_reclinables": false}'::jsonb),
('BT010', 'Mercedes-Benz', 'OH1628', 2023, 48, 'ejecutivo', '{"wifi": true, "aire_acondicionado": true, "asientos_reclinables": true, "entretenimiento": true, "baño": true}'::jsonb);

-- Insertar horarios
INSERT INTO horarios (ruta_id, autobus_id, hora_salida, hora_llegada, dias_semana, precio) VALUES
-- CDMX - Guadalajara
(1, 1, '06:00:00', '12:30:00', '["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]'::jsonb, 480.00),
(1, 3, '14:00:00', '20:30:00', '["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]'::jsonb, 450.00),
(1, 5, '22:00:00', '04:30:00', '["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]'::jsonb, 420.00),

-- CDMX - Monterrey
(2, 2, '20:00:00', '06:00:00', '["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]'::jsonb, 900.00),
(2, 4, '08:00:00', '18:00:00', '["lunes", "miercoles", "viernes", "domingo"]'::jsonb, 850.00),

-- CDMX - Puebla
(3, 6, '07:00:00', '09:00:00', '["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]'::jsonb, 180.00),
(3, 9, '15:00:00', '17:00:00', '["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]'::jsonb, 180.00),
(3, 5, '19:00:00', '21:00:00', '["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]'::jsonb, 160.00),

-- Guadalajara - CDMX
(9, 7, '05:30:00', '12:00:00', '["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]'::jsonb, 480.00),
(9, 8, '13:30:00', '20:00:00', '["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]'::jsonb, 450.00),
(9, 10, '21:30:00', '04:00:00', '["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]'::jsonb, 420.00);

-- Insertar usuario administrador
INSERT INTO users (nombre, email, telefono, password_hash, rol) VALUES
('Administrador', 'admin@bustickets.com', '+52 55 1234 5678', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insertar configuración del sistema
INSERT INTO configuracion (clave, valor, descripcion, tipo) VALUES
('sitio_nombre', 'BusTickets', 'Nombre del sitio web', 'string'),
('sitio_email', 'info@bustickets.com', 'Email de contacto principal', 'string'),
('sitio_telefono', '+52 55 1234 5678', 'Teléfono de contacto', 'string'),
('reserva_tiempo_limite', '30', 'Tiempo límite para completar reserva (minutos)', 'number'),
('pago_metodos', '["efectivo", "tarjeta", "transferencia", "paypal"]', 'Métodos de pago disponibles', 'json'),
('comision_porcentaje', '5.0', 'Porcentaje de comisión por venta', 'number'),
('cancelacion_tiempo_limite', '24', 'Horas antes del viaje para cancelar', 'number'),
('mantenimiento_modo', 'false', 'Modo mantenimiento activado', 'boolean');