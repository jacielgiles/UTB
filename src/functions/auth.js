const { Client } = require('pg');

// Usar la misma variable que en CandyyWorld
const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    const { action, ...userData } = JSON.parse(event.body);

    if (action === 'register') {
      // Validar campos requeridos
      const { nombre, email, telefono, fecha_nacimiento, password_hash } = userData;
      
      if (!nombre || !email || !telefono || !fecha_nacimiento || !password_hash) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Faltan campos requeridos' })
        };
      }

      // Verificar si el email ya existe
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ error: 'El email ya está registrado' })
        };
      }

      // Insertar nuevo usuario
      const result = await client.query(
        `INSERT INTO users (nombre, email, telefono, fecha_nacimiento, password_hash, acepta_newsletter)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, nombre, email, fecha_registro`,
        [nombre, email, telefono, fecha_nacimiento, password_hash, userData.acepta_newsletter || false]
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Usuario registrado exitosamente',
          user: result.rows[0]
        })
      };

    } else if (action === 'login') {
      const { email, password_hash } = userData;

      if (!email || !password_hash) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Email y contraseña son requeridos' })
        };
      }

      // Buscar usuario
      const result = await client.query(
        `SELECT id, nombre, email, activo, bloqueado_hasta, intentos_login
         FROM users 
         WHERE email = $1 AND password_hash = $2`,
        [email, password_hash]
      );

      if (result.rows.length === 0) {
        // Incrementar intentos fallidos si el usuario existe
        await client.query(
          'UPDATE users SET intentos_login = intentos_login + 1 WHERE email = $1',
          [email]
        );

        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Credenciales incorrectas' })
        };
      }

      const user = result.rows[0];

      // Verificar si está bloqueado
      if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date()) {
        return {
          statusCode: 423,
          headers,
          body: JSON.stringify({ 
            error: 'Usuario bloqueado temporalmente. Intenta más tarde.' 
          })
        };
      }

      // Verificar si está activo
      if (!user.activo) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Usuario inactivo' })
        };
      }

      // Login exitoso - resetear intentos y actualizar último acceso
      await client.query(
        'UPDATE users SET intentos_login = 0, ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Login exitoso',
          user: {
            id: user.id,
            nombre: user.nombre,
            email: user.email
          }
        })
      };

    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Acción no válida' })
      };
    }

  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error interno del servidor',
        details: error.message
      })
    };
  } finally {
    await client.end();
  }
};