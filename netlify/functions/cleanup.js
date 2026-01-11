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

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // Limpiar usuarios con hashes base64 (que empiezan con letras mayúsculas)
    const result = await client.query(`
      DELETE FROM users 
      WHERE password_hash ~ '^[A-Z]' 
      OR length(password_hash) < 6
    `);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Base de datos limpiada',
        deleted_users: result.rowCount
      })
    };

  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error al limpiar base de datos',
        details: error.message
      })
    };
  } finally {
    await client.end();
  }
};