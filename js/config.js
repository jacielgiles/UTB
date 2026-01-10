// Configuración centralizada para BusTickets
const CONFIG = {
    // API Backend con Netlify Functions (Recomendado)
    API: {
        BASE_URL: window.location.origin + '/.netlify/functions',
        HEADERS: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    },
    
    // Configuración de la aplicación
    APP: {
        NAME: 'BusTickets',
        VERSION: '1.0.0',
        ENVIRONMENT: window.location.hostname === 'localhost' ? 'development' : 'production'
    },
    
    // Configuración de validación
    VALIDATION: {
        PASSWORD_MIN_LENGTH: 8,
        PHONE_LENGTH: 10,
        MIN_AGE: 18
    },
    
    // Mensajes de la aplicación
    MESSAGES: {
        SUCCESS: {
            LOGIN: '¡Bienvenido! Redirigiendo...',
            REGISTER: '¡Cuenta creada exitosamente!',
            LOGOUT: 'Sesión cerrada correctamente'
        },
        ERROR: {
            INVALID_EMAIL: 'Por favor ingresa un email válido',
            INVALID_PHONE: 'El teléfono debe tener exactamente 10 dígitos',
            PASSWORD_MISMATCH: 'Las contraseñas no coinciden',
            REQUIRED_FIELDS: 'Por favor completa todos los campos',
            MIN_AGE: 'Debes ser mayor de 18 años para registrarte',
            CONNECTION_ERROR: 'Error de conexión. Intenta nuevamente.',
            API_KEY_MISSING: 'Error de configuración del API Key'
        }
    },
    
    // URLs de la aplicación
    URLS: {
        HOME: 'index.html',
        LOGIN: 'login.html',
        REGISTER: 'register.html'
    }
};

// Función para obtener headers de autenticación
function getAuthHeaders() {
    return CONFIG.API.HEADERS;
}

// Función para construir URL de API
function getApiUrl(endpoint = '') {
    return CONFIG.API.BASE_URL + endpoint;
}

// Función para validar email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Función para validar teléfono
function isValidPhone(phone) {
    return /^[0-9]{10}$/.test(phone);
}

// Función para validar edad
function isValidAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age >= CONFIG.VALIDATION.MIN_AGE;
}

// Función para validar contraseña fuerte
function isStrongPassword(password) {
    if (password.length < CONFIG.VALIDATION.PASSWORD_MIN_LENGTH) return false;
    if (!/(?=.*[a-z])/.test(password)) return false;
    if (!/(?=.*[A-Z])/.test(password)) return false;
    if (!/(?=.*\d)/.test(password)) return false;
    return true;
}

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getAuthHeaders, getApiUrl, isValidEmail, isValidPhone, isValidAge, isStrongPassword };
} else {
    window.CONFIG = CONFIG;
    window.getAuthHeaders = getAuthHeaders;
    window.getApiUrl = getApiUrl;
    window.isValidEmail = isValidEmail;
    window.isValidPhone = isValidPhone;
    window.isValidAge = isValidAge;
    window.isStrongPassword = isStrongPassword;
}