// JavaScript para páginas de autenticación
document.addEventListener('DOMContentLoaded', function() {
    initAuthForms();
    initPasswordToggle();
    initFormValidation();
});

// Configuración de la API (usando CONFIG)
const API_BASE_URL = getApiUrl();

// Headers para autenticación
function getAuthHeaders() {
    return CONFIG.API.HEADERS;
}

// Inicializar formularios de autenticación
function initAuthForms() {
    const loginForm = document.querySelector('#loginForm');
    const registerForm = document.querySelector('#registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

// Función para generar hash de contraseña consistente
function createPasswordHash(password) {
    // Usar un hash simple pero consistente
    let hash = 0;
    const str = password + 'bustickets_salt'; // Agregar salt
    
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convertir a string hexadecimal y asegurar longitud mínima
    const hashStr = Math.abs(hash).toString(16);
    return 'bt_' + hashStr.padStart(8, '0'); // Prefijo + hash de 8 dígitos mínimo
}

// Manejar login
function handleLogin(e) {
    e.preventDefault();
    
    const email = e.target.querySelector('input[name="email"]').value;
    const password = e.target.querySelector('input[name="password"]').value;
    
    if (!email || !password) {
        showAuthError('Por favor completa todos los campos');
        return;
    }
    
    if (!isValidEmail(email)) {
        showAuthError('Por favor ingresa un email válido');
        return;
    }
    
    // Mostrar loading
    showAuthLoading('Iniciando sesión...');
    
    // Intentar login con la base de datos
    loginUserInDatabase({
        email: email,
        password_hash: password // Usar contraseña directa, sin hash
    });
}

// Login de usuario en la base de datos
async function loginUserInDatabase(userData) {
    try {
        console.log('📡 Intentando login:', { 
            email: userData.email, 
            password_hash: userData.password_hash 
        });
        
        const requestData = {
            action: 'login',
            ...userData
        };
        
        const response = await fetch(`${API_BASE_URL}/auth`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(requestData)
        });
        
        console.log('📊 Status de login:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Login exitoso:', result);
            
            // Guardar datos del usuario en localStorage
            const userData = {
                id: result.user.id,
                nombre: result.user.nombre,
                email: result.user.email,
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('bustickets_user', JSON.stringify(userData));
            showAuthSuccess('¡Bienvenido! Redirigiendo...');
            
            setTimeout(() => {
                window.location.href = CONFIG.URLS.HOME;
            }, 1500);
        } else {
            const errorData = await response.json();
            console.error('❌ Error de login:', errorData);
            
            if (response.status === 401) {
                showAuthError('Email o contraseña incorrectos. Verifica tus datos.');
            } else if (response.status === 423) {
                showAuthError('Usuario bloqueado temporalmente. Intenta más tarde.');
            } else if (response.status === 403) {
                showAuthError('Usuario inactivo. Contacta al soporte.');
            } else {
                showAuthError('Error al iniciar sesión: ' + (errorData.error || 'Error desconocido'));
            }
            resetAuthButton();
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        showAuthError('Error de conexión. Verifica tu internet e intenta nuevamente.');
        resetAuthButton();
    }
}

// Manejar registro
function handleRegister(e) {
    e.preventDefault();
    
    const form = e.target;
    const nombre = form.querySelector('input[name="nombre"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const telefono = form.querySelector('input[name="telefono"]').value.trim();
    const fechaNacimiento = form.querySelector('input[name="fecha_nacimiento"]').value;
    const password = form.querySelector('input[name="password"]').value;
    const confirmPassword = form.querySelector('input[name="confirm_password"]').value;
    const terms = form.querySelector('input[name="terms"]').checked;
    const privacy = form.querySelector('input[name="privacy"]').checked;
    const newsletter = form.querySelector('input[name="newsletter"]');
    const newsletterValue = newsletter ? newsletter.checked : false;
    
    let errors = [];
    
    // Validaciones básicas
    if (!nombre || !email || !telefono || !fechaNacimiento || !password || !confirmPassword) {
        errors.push(CONFIG.MESSAGES.ERROR.REQUIRED_FIELDS);
    }
    
    // Validar nombre (mínimo 2 palabras)
    if (nombre && nombre.split(' ').length < 2) {
        errors.push('Ingresa tu nombre completo (nombre y apellido)');
    }
    
    // Validar email
    if (!isValidEmail(email)) {
        errors.push(CONFIG.MESSAGES.ERROR.INVALID_EMAIL);
    }
    
    // Validar teléfono (10 dígitos)
    if (!isValidPhone(telefono)) {
        errors.push(CONFIG.MESSAGES.ERROR.INVALID_PHONE);
    }
    
    // Validar edad (mayor de 18 años)
    if (fechaNacimiento && !isValidAge(fechaNacimiento)) {
        errors.push(CONFIG.MESSAGES.ERROR.MIN_AGE);
    }
    
    // Validar contraseña fuerte
    if (password && !isStrongPassword(password)) {
        errors.push('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
    }
    
    // Validar confirmación de contraseña
    if (password !== confirmPassword) {
        errors.push(CONFIG.MESSAGES.ERROR.PASSWORD_MISMATCH);
    }
    
    // Validar términos y privacidad
    if (!terms) {
        errors.push('Debes aceptar los términos y condiciones');
    }
    
    if (!privacy) {
        errors.push('Debes aceptar la política de privacidad');
    }
    
    if (errors.length > 0) {
        showAuthError(errors.join('<br>'));
        return;
    }
    
    // Mostrar loading
    showAuthLoading('Creando cuenta...');
    
    // Intentar registrar en la base de datos real
    registerUserInDatabase({
        nombre: nombre,
        email: email,
        telefono: telefono,
        fecha_nacimiento: fechaNacimiento,
        password_hash: password, // Guardar contraseña directa, sin hash
        acepta_newsletter: newsletterValue
    });
}

// Registrar usuario en la base de datos real
async function registerUserInDatabase(userData) {
    try {
        console.log('📡 Enviando datos de registro:', {
            ...userData,
            password_hash: userData.password_hash // Mostrar el hash generado
        });
        
        const requestData = {
            action: 'register',
            ...userData
        };
        
        const response = await fetch(`${API_BASE_URL}/auth`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(requestData)
        });
        
        console.log('📊 Status de registro:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Usuario registrado exitosamente:', result);
            showAuthSuccess('¡Cuenta creada exitosamente! Ya puedes iniciar sesión.');
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            const errorData = await response.json();
            console.error('❌ Error de registro:', errorData);
            
            if (response.status === 409) {
                showAuthError('Este email ya está registrado. Intenta con otro email.');
            } else if (response.status === 400) {
                showAuthError(errorData.error || 'Datos inválidos. Verifica todos los campos.');
            } else {
                showAuthError('Error al crear la cuenta: ' + (errorData.error || 'Error desconocido'));
            }
            resetAuthButton();
        }
    } catch (error) {
        console.error('❌ Error de conexión en registro:', error);
        showAuthError('Error de conexión. Verifica tu internet e intenta nuevamente.');
        resetAuthButton();
    }
}

// Fallback: registrar localmente si no hay conexión a la DB
function registerUserLocally(userData) {
    const existingUsers = JSON.parse(localStorage.getItem('bustickets_users') || '[]');
    const emailExists = existingUsers.some(user => user.email === userData.email);
    const phoneExists = existingUsers.some(user => user.telefono === userData.telefono);
    
    if (emailExists) {
        showAuthError('Este email ya está registrado');
        resetAuthButton();
        return;
    }
    
    if (phoneExists) {
        showAuthError('Este teléfono ya está registrado');
        resetAuthButton();
        return;
    }
    
    // Crear nuevo usuario localmente
    const newUser = {
        id: Date.now(),
        ...userData,
        registrationDate: new Date().toISOString(),
        activo: true,
        rol: 'cliente'
    };
    
    existingUsers.push(newUser);
    localStorage.setItem('bustickets_users', JSON.stringify(existingUsers));
    
    showAuthSuccess('¡Cuenta creada exitosamente!');
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

// Toggle para mostrar/ocultar contraseña
function initPasswordToggle() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    
    passwordInputs.forEach(input => {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        toggleBtn.style.cssText = `
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            color: #666;
            padding: 5px;
        `;
        
        toggleBtn.addEventListener('click', function() {
            if (input.type === 'password') {
                input.type = 'text';
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                input.type = 'password';
                this.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
        
        wrapper.appendChild(toggleBtn);
    });
}

// Validación en tiempo real
function initFormValidation() {
    const inputs = document.querySelectorAll('.auth-form input');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

// Validar campo individual
function validateField(field) {
    const value = field.value.trim();
    const name = field.name;
    let isValid = true;
    let message = '';
    
    switch (name) {
        case 'email':
            if (value && !isValidEmail(value)) {
                isValid = false;
                message = 'Email no válido';
            }
            break;
            
        case 'password':
            if (value && value.length < 8) {
                isValid = false;
                message = 'Mínimo 8 caracteres';
            }
            break;
            
        case 'confirm_password':
            const password = document.querySelector('input[name="password"]').value;
            if (value && value !== password) {
                isValid = false;
                message = 'Las contraseñas no coinciden';
            }
            break;
            
        case 'nombre':
            if (value && value.split(' ').length < 2) {
                isValid = false;
                message = 'Ingresa nombre completo';
            }
            break;
            
        case 'telefono':
            if (value && !/^[0-9]{10}$/.test(value)) {
                isValid = false;
                message = 'Debe tener 10 dígitos';
            }
            break;
    }
    
    if (!isValid) {
        showFieldError(field, message);
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

// Mostrar error en campo
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.style.borderColor = '#e74c3c';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    errorDiv.style.cssText = `
        color: #e74c3c;
        font-size: 0.85rem;
        margin-top: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    `;
    
    field.parentNode.appendChild(errorDiv);
}

// Limpiar error de campo
function clearFieldError(field) {
    field.style.borderColor = '#e2e8f0';
    
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Mostrar error de autenticación
function showAuthError(message) {
    const existingError = document.querySelector('.auth-error');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'auth-error';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
    `;
    errorDiv.style.cssText = `
        background-color: #fed7d7;
        color: #c53030;
        border: 1px solid #feb2b2;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-weight: 500;
        animation: shake 0.5s ease-in-out;
    `;
    
    const form = document.querySelector('.auth-form');
    form.insertBefore(errorDiv, form.firstChild);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => errorDiv.remove(), 300);
        }
    }, 5000);
}

// Mostrar mensaje de éxito
function showAuthSuccess(message) {
    const existingError = document.querySelector('.auth-error');
    if (existingError) {
        existingError.remove();
    }
    
    const successDiv = document.createElement('div');
    successDiv.className = 'auth-success';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    successDiv.style.cssText = `
        background-color: #c6f6d5;
        color: #38a169;
        border: 1px solid #9ae6b4;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-weight: 500;
        animation: slideDown 0.5s ease-in-out;
    `;
    
    const form = document.querySelector('.auth-form');
    form.insertBefore(successDiv, form.firstChild);
}

// Mostrar loading
function showAuthLoading(message) {
    const submitBtn = document.querySelector('.btn-auth');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            ${message}
        `;
    }
}

// Resetear botón de autenticación
function resetAuthButton() {
    const submitBtn = document.querySelector('.btn-auth');
    if (submitBtn) {
        submitBtn.disabled = false;
        if (document.querySelector('#loginForm')) {
            submitBtn.innerHTML = `
                <i class="fas fa-sign-in-alt"></i>
                Iniciar Sesión
            `;
        } else {
            submitBtn.innerHTML = `
                <i class="fas fa-user-plus"></i>
                Crear Cuenta
            `;
        }
    }
}

// Validar email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Función global para mostrar notificaciones
function showNotification(message, type = 'info') {
    if (window.BusTickets && window.BusTickets.showNotification) {
        window.BusTickets.showNotification(message, type);
    } else {
        alert(message);
    }
}

// Agregar estilos de animación
const authStyle = document.createElement('style');
authStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .fa-spinner {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(authStyle);