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
    
    if (user && userMenu && authButtons) {
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
            return true;
        } else {
            const errorText = await response.text();
            console.log('❌ Error en Neon API:', errorText);
            
            if (errorText.includes('JWT') || errorText.includes('authentication')) {
                console.log('🔑 La API requiere autenticación válida');
                console.log('💡 Solución: Usar el backend local (recomendado)');
            } else if (response.status === 404 && errorText.includes('relation "users" does not exist')) {
                console.log('🗄️ La tabla users no existe en la base de datos');
                console.log('💡 Solución: Crear la tabla usando el backend local');
            }
            return false;
        }
    } catch (error) {
        console.error('❌ Error con Neon API:', error);
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
                return false;
            }
        }
        
        return true;
    } catch (error) {
        console.log('⚠️ No se pudo verificar la tabla users');
        return false;
    }
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        max-width: 300px;
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: #27ae60;' : 
          type === 'error' ? 'background: #e74c3c;' : 
          'background: #3498db;'}
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
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