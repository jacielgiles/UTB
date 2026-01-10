// JavaScript principal para BusTickets
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes
    initMobileMenu();
    initSearchForm();
    initAnimations();
});

// Verificar sesión de usuario
function checkUserSession() {
    const user = localStorage.getItem('bustickets_user');
    const userMenu = document.getElementById('userMenu');
    const authButtons = document.getElementById('authButtons');
    const userName = document.getElementById('userName');
    
    if (user && userMenu && authButtons && userName) {
        const userData = JSON.parse(user);
        userName.textContent = userData.nombre;
        userMenu.style.display = 'flex';
        authButtons.style.display = 'none';
    }
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('bustickets_user');
    showNotification('Sesión cerrada correctamente', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Funciones para el modal de autenticación
function openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Menú móvil hamburguesa
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Prevenir scroll del body cuando el menú está abierto
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        });
        
        // Cerrar menú al hacer click en un enlace
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });
        
        // Cerrar menú al hacer click fuera
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
}

// Formulario de búsqueda
function initSearchForm() {
    const searchForm = document.querySelector('.search-form form');
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const origen = this.querySelector('input[name="origen"]').value;
            const destino = this.querySelector('input[name="destino"]').value;
            const fecha = this.querySelector('input[name="fecha"]').value;
            
            if (!origen || !destino || !fecha) {
                showNotification('Por favor completa todos los campos', 'error');
                return;
            }
            
            // Validar que la fecha no sea en el pasado
            const fechaSeleccionada = new Date(fecha);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            
            if (fechaSeleccionada < hoy) {
                showNotification('La fecha no puede ser anterior a hoy', 'error');
                return;
            }
            
            // Simular búsqueda
            showNotification('Buscando boletos disponibles...', 'info');
            
            setTimeout(() => {
                showNotification('Búsqueda completada', 'success');
            }, 2000);
        });
    }
}

// Animaciones y efectos
function initAnimations() {
    // Animación de scroll suave para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Animación de aparición de elementos
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar elementos con animación
    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Sistema de notificaciones mejorado
function showNotification(message, type = 'info', duration = 5000) {
    // Remover notificación existente
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Crear nueva notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = getNotificationIcon(type);
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" aria-label="Cerrar notificación">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Estilos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        max-width: 400px;
        min-width: 300px;
        animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        border-left: 4px solid ${getNotificationColor(type)};
        backdrop-filter: blur(10px);
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Evento para cerrar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Auto-cerrar después del tiempo especificado
    setTimeout(() => {
        if (notification.parentNode) {
            closeNotification(notification);
        }
    }, duration);
    
    // Cerrar con Escape
    const handleEscape = (e) => {
        if (e.key === 'Escape' && notification.parentNode) {
            closeNotification(notification);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function closeNotification(notification) {
    notification.style.animation = 'slideOutRight 0.3s ease-in-out';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-triangle',
        warning: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle'
    };
    return icons[type] || icons.info;
}

function getNotificationColor(type) {
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    return colors[type] || colors.info;
}

// Cerrar modal al hacer click fuera
document.addEventListener('click', function(e) {
    const modal = document.getElementById('authModal');
    if (e.target === modal) {
        closeAuthModal();
    }
});

// Cerrar modal con tecla Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeAuthModal();
    }
});

// Agregar estilos de animación mejorados
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
    }
    
    .notification-close {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        margin: -0.5rem -0.25rem -0.5rem 0;
        opacity: 0.7;
        transition: all 0.3s ease;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
    
    .notification-close:hover {
        opacity: 1;
        background-color: rgba(0,0,0,0.1);
        transform: scale(1.1);
    }
    
    .notification-close:active {
        transform: scale(0.95);
    }
    
    @media (max-width: 480px) {
        .notification {
            left: 10px !important;
            right: 10px !important;
            max-width: none !important;
            min-width: auto !important;
        }
    }
`;
document.head.appendChild(style);
// Función para probar conexión a la base de datos
async function testDatabaseConnection() {
    const apiUrl = getApiUrl();
    const headers = getAuthHeaders();
    
    try {
        console.log('🔍 Probando conexión a la base de datos...');
        console.log('📡 URL:', apiUrl);
        console.log('🔧 Método: Backend Local (Node.js)');
        
        // Primero probar el backend local
        const response = await fetch(apiUrl + '/test', {
            method: 'GET',
            headers: headers
        });
        
        console.log('📊 Status de respuesta:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Conexión exitosa');
            console.log('📋 Datos recibidos:', data);
            showDatabaseStatus(true, 'Conectada');
            
            // Verificar si la tabla users existe
            await checkUsersTable();
            return true;
        } else {
            console.log('⚠️ Backend local no disponible');
            console.log('🔄 Intentando con API REST de Neon...');
            
            // Fallback a API REST de Neon
            return await tryNeonRestAPI();
        }
    } catch (error) {
        console.error('❌ Error de conexión al backend local:', error);
        console.log('🔄 Intentando con API REST de Neon...');
        
        // Fallback a API REST de Neon
        return await tryNeonRestAPI();
    }
}

// Función para probar API REST de Neon como fallback
async function tryNeonRestAPI() {
    try {
        console.log('📡 Probando API REST de Neon...');
        console.log('🔓 API configurada sin Row Level Security');
        
        // Primero probar sin autenticación
        let response = await fetch(CONFIG.NEON_API.BASE_URL + '/users?limit=1', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Status sin auth:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Neon API funciona sin autenticación');
            console.log('📋 Datos:', data);
            showDatabaseStatus(true, 'Neon API');
            return true;
        }
        
        // Si falla, probar con el token
        console.log('🔑 Probando con token...');
        response = await fetch(CONFIG.NEON_API.BASE_URL + '/users?limit=1', {
            method: 'GET',
            headers: CONFIG.NEON_API.HEADERS
        });
        
        console.log('📊 Status con token:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Neon API funciona con token');
            console.log('📋 Datos:', data);
            showDatabaseStatus(true, 'Neon API');
            return true;
        } else {
            const errorText = await response.text();
            console.log('❌ Error en Neon API:', errorText);
            
            if (errorText.includes('JWT') || errorText.includes('authentication')) {
                showDatabaseStatus(false, 'Auth Requerida');
                console.log('🔑 La API requiere autenticación válida');
                console.log('💡 Solución: Usar el backend local (recomendado)');
            } else if (response.status === 404 && errorText.includes('relation "users" does not exist')) {
                showDatabaseStatus(false, 'Tabla No Existe');
                console.log('🗄️ La tabla users no existe en la base de datos');
                console.log('💡 Solución: Crear la tabla usando el backend local');
            } else {
                showDatabaseStatus(false, 'Error API');
            }
            return false;
        }
    } catch (error) {
        console.error('❌ Error con Neon API:', error);
        showDatabaseStatus(false, 'Sin Conexión');
        return false;
    }
}

// Verificar si la tabla users existe
async function checkUsersTable() {
    try {
        const response = await fetch(getApiUrl() + '/users?limit=1', {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        if (response.status === 500) {
            const error = await response.json();
            if (error.error && error.error.includes('relation "users" does not exist')) {
                console.log('⚠️ La tabla users no existe');
                showDatabaseStatus(false, 'Tabla No Existe');
                return false;
            }
        }
        
        return true;
    } catch (error) {
        console.log('⚠️ No se pudo verificar la tabla users');
        return false;
    }
}

// Mostrar estado de la base de datos con información específica
function showDatabaseStatus(isConnected, message) {
    // Remover indicador anterior
    const existing = document.getElementById('db-status');
    if (existing) existing.remove();
    
    const indicator = document.createElement('div');
    indicator.id = 'db-status';
    indicator.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        padding: 8px 12px;
        border-radius: 6px;
        color: white;
        font-size: 12px;
        font-weight: 600;
        z-index: 10001;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.3s ease;
        cursor: pointer;
        max-width: 200px;
        ${isConnected ? 
            'background: linear-gradient(135deg, #27ae60, #2ecc71);' : 
            'background: linear-gradient(135deg, #e74c3c, #ec7063);'
        }
    `;
    
    const icon = isConnected ? 'database' : 'exclamation-triangle';
    
    indicator.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>DB: ${message}</span>
    `;
    
    // Click para mostrar ayuda específica
    indicator.addEventListener('click', () => {
        if (message === 'Tabla No Existe') {
            showTableSetupHelp();
        } else if (message.includes('JWT') || message.includes('Inválido')) {
            showJWTHelp();
        } else {
            console.clear();
            console.log('🔍 Ejecutando test detallado de base de datos...');
            if (window.dbTest) {
                window.dbTest.full();
            } else {
                testDatabaseConnection();
            }
        }
    });
    
    document.body.appendChild(indicator);
    
    // Auto-remover después de 15 segundos si está conectada
    if (isConnected) {
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.style.opacity = '0';
                setTimeout(() => indicator.remove(), 300);
            }
        }, 15000);
    }
}

// Mostrar ayuda para configurar la tabla
function showTableSetupHelp() {
    const helpModal = document.createElement('div');
    helpModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    helpModal.innerHTML = `
        <div style="
            background: white;
            border-radius: 12px;
            padding: 2rem;
            max-width: 600px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="margin: 0; color: #1a365d;">🗄️ Configurar Base de Datos</h3>
                <button onclick="this.closest('div').parentElement.remove()" style="
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #666;
                ">×</button>
            </div>
            
            <div style="color: #4a5568; line-height: 1.6;">
                <p><strong>Problema:</strong> La tabla "users" no existe en tu base de datos.</p>
                
                <div style="background: #e6fffa; padding: 1rem; border-radius: 8px; margin: 1rem 0; border-left: 4px solid #38b2ac;">
                    <strong>🚀 Solución Automática (Recomendada):</strong><br>
                    Haz clic en el botón de abajo para crear la tabla automáticamente.
                </div>
                
                <button onclick="setupDatabase()" style="
                    background: #38b2ac;
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    margin: 1rem 0;
                    width: 100%;
                    font-size: 1.1rem;
                ">
                    🔧 Configurar Base de Datos Automáticamente
                </button>
                
                <div style="background: #f7fafc; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                    <strong>📋 Alternativa Manual:</strong><br>
                    1. Ve a <a href="https://console.neon.tech" target="_blank" style="color: #2c5282;">console.neon.tech</a><br>
                    2. Selecciona tu proyecto: <code>bitter-darkness-74926925</code><br>
                    3. Ve a SQL Editor<br>
                    4. Ejecuta el archivo <code>database/auto_setup.sql</code>
                </div>
                
                <button onclick="window.open('https://console.neon.tech', '_blank')" style="
                    background: #1a365d;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    margin-top: 1rem;
                ">
                    🌐 Ir a Neon Console
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(helpModal);
    
    // Cerrar al hacer clic fuera
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.remove();
        }
    });
}

// Función para configurar la base de datos automáticamente
async function setupDatabase() {
    try {
        console.log('🔧 Configurando base de datos automáticamente...');
        
        const response = await fetch(getApiUrl() + '/setup', {
            method: 'POST',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Base de datos configurada:', result);
            
            showNotification('¡Base de datos configurada exitosamente!', 'success');
            
            // Cerrar modal
            const modal = document.querySelector('[style*="position: fixed"]');
            if (modal) modal.remove();
            
            // Probar conexión nuevamente
            setTimeout(() => {
                testDatabaseConnection();
            }, 1000);
            
        } else {
            const error = await response.json();
            console.error('❌ Error al configurar:', error);
            showNotification('Error al configurar la base de datos: ' + error.error, 'error');
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        showNotification('Error de conexión. ¿Está ejecutándose el backend?', 'error');
    }
}

// Hacer la función global
window.setupDatabase = setupDatabase;

// Mostrar ayuda para JWT
function showJWTHelp() {
    const helpModal = document.createElement('div');
    helpModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    helpModal.innerHTML = `
        <div style="
            background: white;
            border-radius: 12px;
            padding: 2rem;
            max-width: 500px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="margin: 0; color: #1a365d;">🔑 JWT Requerido</h3>
                <button onclick="this.closest('div').parentElement.remove()" style="
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #666;
                ">×</button>
            </div>
            
            <div style="color: #4a5568; line-height: 1.6;">
                <p><strong>Problema:</strong> El API key actual no es un JWT válido.</p>
                
                <p><strong>Solución:</strong></p>
                <ol style="margin: 1rem 0; padding-left: 1.5rem;">
                    <li>Ve a <a href="https://console.neon.tech" target="_blank" style="color: #2c5282;">console.neon.tech</a></li>
                    <li>Selecciona tu proyecto: <code>bitter-darkness-74926925</code></li>
                    <li>Ve a Settings → API Keys</li>
                    <li>Crea un nuevo API Key</li>
                    <li>Copia el JWT (se ve así: <code>eyJhbGci...</code>)</li>
                    <li>Reemplázalo en <code>js/config.js</code></li>
                </ol>
                
                <div style="background: #f7fafc; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                    <strong>💡 Mientras tanto:</strong><br>
                    La aplicación funciona en modo desarrollo con datos simulados.
                </div>
                
                <button onclick="window.open('https://console.neon.tech', '_blank')" style="
                    background: #1a365d;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    margin-top: 1rem;
                ">
                    🚀 Ir a Neon Console
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(helpModal);
    
    // Cerrar al hacer clic fuera
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.remove();
        }
    });
}

// Probar conexión automáticamente al cargar la página
setTimeout(() => {
    testDatabaseConnection();
}, 1000);

// Hacer las funciones globales
window.testDatabaseConnection = testDatabaseConnection;
window.checkUserSession = checkUserSession;
window.logout = logout;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;