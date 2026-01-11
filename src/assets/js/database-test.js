// Test de conexión a la base de datos usando Netlify Functions
class DatabaseTester {
    constructor() {
        this.apiUrl = window.location.origin + '/.netlify/functions';
        this.init();
    }

    init() {
        console.log('🔌 Iniciando test de conexión usando Netlify Functions...');
        console.log('📊 API URL:', this.apiUrl);
        this.runAllTests();
    }

    async runAllTests() {
        console.log('\n=== INICIANDO TESTS DE CONEXIÓN ===\n');
        
        // Test 1: Conectividad básica con función test
        await this.testBasicConnection();
        
        // Test 2: Verificar autenticación
        await this.testAuthEndpoint();
        
        console.log('\n=== TESTS COMPLETADOS ===\n');
    }

    async testBasicConnection() {
        console.log('🔍 Test 1: Conectividad básica con Netlify Functions');
        
        try {
            const response = await fetch(this.apiUrl + '/test', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            console.log('📡 Status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Conexión básica exitosa');
                console.log('📄 Respuesta:', data);
                
                if (data.database) {
                    console.log('🗄️ Base de datos:', data.database.version);
                    console.log('📊 Tabla users existe:', data.tables.users_exists);
                    console.log('👥 Usuarios registrados:', data.tables.users_count);
                }
            } else {
                const errorText = await response.text();
                console.log('⚠️ Conexión con errores:', response.statusText);
                console.log('❌ Error:', errorText);
            }
        } catch (error) {
            console.error('❌ Error de conectividad:', error);
        }
    }

    async testAuthEndpoint() {
        console.log('\n🔍 Test 2: Endpoint de autenticación');
        
        try {
            // Test con datos inválidos para verificar que el endpoint responde
            const testData = {
                action: 'login',
                email: 'test@example.com',
                password_hash: 'invalid_hash'
            };
            
            const response = await fetch(this.apiUrl + '/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(testData)
            });
            
            console.log('📡 Auth Status:', response.status);
            
            const data = await response.json();
            console.log('📄 Auth Response:', data);
            
            if (response.status === 401) {
                console.log('✅ Endpoint de autenticación funciona correctamente (credenciales inválidas esperadas)');
            } else {
                console.log('📊 Respuesta inesperada del endpoint de auth');
            }
            
        } catch (error) {
            console.error('❌ Error en test de auth:', error);
        }
    }

    // Método para probar registro de usuario
    async testRegister() {
        console.log('\n🔍 Test de registro de usuario');
        
        const testUser = {
            action: 'register',
            nombre: 'Usuario Test',
            email: `test_${Date.now()}@bustickets.com`,
            telefono: '5512345678',
            fecha_nacimiento: '1990-01-01',
            password_hash: 'hash_test_123456',
            acepta_newsletter: false
        };
        
        try {
            console.log('📡 Intentando registrar usuario de prueba...');
            console.log('📋 Datos:', testUser);
            
            const response = await fetch(this.apiUrl + '/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(testUser)
            });
            
            console.log('📊 Status:', response.status);
            
            const result = await response.json();
            console.log('📄 Resultado:', result);
            
            if (response.ok) {
                console.log('✅ Registro exitoso:', result);
            } else {
                console.log('❌ Error en registro:', result);
            }
        } catch (error) {
            console.error('❌ Error de registro:', error);
        }
    }
}

// Funciones globales para usar en la consola
window.dbTest = {
    // Test completo
    full: () => {
        console.log('🔍 Ejecutando test completo de base de datos...');
        new DatabaseTester();
    },
    
    // Test rápido de conexión
    quick: async () => {
        console.log('🔍 Test rápido - Netlify Functions...');
        
        try {
            const apiUrl = window.location.origin + '/.netlify/functions';
            const response = await fetch(apiUrl + '/test');
            console.log('📊 Status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Netlify Functions OK:', data);
                
                if (data.tables && data.tables.users_exists) {
                    console.log('🗄️ Tabla users: ✅ Existe');
                    console.log('👥 Usuarios: ' + data.tables.users_count);
                } else {
                    console.log('⚠️ Tabla users no encontrada - ejecuta database/users_table.sql');
                }
            } else {
                const error = await response.text();
                console.log('❌ Error:', error);
            }
        } catch (error) {
            console.error('❌ Error de conexión:', error);
        }
    },
    
    // Test de registro
    register: async () => {
        console.log('🔍 Test de registro...');
        const tester = new DatabaseTester();
        await tester.testRegister();
    },
    
    // Ayuda
    help: () => {
        console.log(`
🔧 Comandos disponibles para testing de base de datos:

📋 Comandos básicos:
• dbTest.full()     - Test completo de conexión
• dbTest.quick()    - Test rápido
• dbTest.register() - Test de registro de usuario
• dbTest.help()     - Esta ayuda

🌐 Usando Netlify Functions:
• /.netlify/functions/test - Test de conexión
• /.netlify/functions/auth - Autenticación y registro

📊 Para ver todos los detalles, abre las DevTools (F12) y ve a Console.
        `);
    }
};

// Verificar que dbTest se cargó correctamente
console.log('🔧 Database Tester cargado. window.dbTest disponible:', !!window.dbTest);

// Auto-ejecutar test si estamos en desarrollo
if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
    console.log('🚀 Modo desarrollo - Ejecutando test automático en 2 segundos...');
    setTimeout(() => {
        if (window.dbTest && typeof window.dbTest.quick === 'function') {
            window.dbTest.quick();
        } else {
            console.log('⚠️ dbTest.quick no está disponible');
        }
    }, 2000);
}

// Mostrar ayuda inicial
console.log('🔧 Database Tester cargado. Escribe "dbTest.help()" para ver comandos.');

// Exportar para módulos si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseTester;
}