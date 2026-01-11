const { Client } = require('pg');

// Usar la misma variable que en CandyyWorld
const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // Test básico de conexión
    const versionResult = await client.query('SELECT version()');
    
    // Verificar si existe la tabla users
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      )
    `);

    let usersCount = 0;
    let recentUsers = [];

    if (tableCheck.rows[0].exists) {
      // Contar usuarios
      const countResult = await client.query('SELECT COUNT(*) FROM users');
      usersCount = parseInt(countResult.rows[0].count);

      // Obtener últimos usuarios (sin datos sensibles)
      const recentResult = await client.query(`
        SELECT id, nombre, email, fecha_registro, activo
        FROM users 
        ORDER BY fecha_registro DESC 
        LIMIT 3
      `);
      recentUsers = recentResult.rows;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Conexión a base de datos exitosa',
        database: {
          version: versionResult.rows[0].version,
          connected: true,
          timestamp: new Date().toISOString()
        },
        tables: {
          users_exists: tableCheck.rows[0].exists,
          users_count: usersCount,
          recent_users: recentUsers
        }
      })
    };

  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error de conexión a base de datos',
        details: error.message,
        timestamp: new Date().toISOString()
      })
    };
  } finally {
    await client.end();
  }
};