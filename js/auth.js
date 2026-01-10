// JavaScript para páginas de autenticación
document.addEventListener('DOMContentLoaded', function() {
    initAuthForms();
    initPasswordToggle();
    initFormValidation();
});

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
    
    // Simular autenticación (en producción sería una API)
    setTimeout(() => {
        if (email === 'admin@bustickets.com' && password === '123456') {
            // Login exitoso
            const userData = {
                nombre: 'Administrador',
                email: email,
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('bustickets_user', JSON.stringify(userData));
            showNotification('¡Bienvenido! Redirigiendo...', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            // Login fallido
            showAuthError('Email o contraseña incorrectos');
            resetAuthButton();
        }
    }, 2000);
}

// Manejar registro
function handleRegister(e) {
    e.preventDefault();
    
    const form = e.target;
    const nombre = form.querySelector('input[name="nombre"]').value;
    const email = form.querySelector('input[name="email"]').value;
    const telefono = form.querySelector('input[name="telefono"]').value;
    const password = form.querySelector('input[name="password"]').value;
    const confirmPassword = form.querySelector('input[name="confirm_password"]').value;
    const terms = form.querySelector('input[name="terms"]').checked;
    
    let errors = [];
    
    if (!nombre || !email || !password || !confirmPassword) {
        errors.push('Todos los campos son obligatorios');
    }
    
    if (!isValidEmail(email)) {
        errors.push('Por favor ingresa un email válido');
    }
    
    if (password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
    }
    
    if (password !== confirmPassword) {
        errors.push('Las contraseñas no coinciden');
    }
    
    if (!terms) {
        errors.push('Debes aceptar los términos y condiciones');
    }
    
    if (errors.length > 0) {
        showAuthError(errors.join('<br>'));
        return;
    }
    
    // Mostrar loading
    showAuthLoading('Creando cuenta...');
    
    // Simular registro (en producción sería una API)
    setTimeout(() => {
        // Verificar si el email ya existe
        const existingUsers = JSON.parse(localStorage.getItem('bustickets_users') || '[]');
        const emailExists = existingUsers.some(user => user.email === email);
        
        if (emailExists) {
            showAuthError('Este email ya está registrado');
            resetAuthButton();
            return;
        }
        
        // Crear nuevo usuario
        const newUser = {
            id: Date.now(),
            nombre: nombre,
            email: email,
            telefono: telefono,
            registrationDate: new Date().toISOString()
        };
        
        existingUsers.push(newUser);
        localStorage.setItem('bustickets_users', JSON.stringify(existingUsers));
        
        showAuthSuccess('¡Cuenta creada exitosamente! Ya puedes iniciar sesión.');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
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
            if (value && value.length < 6) {
                isValid = false;
                message = 'Mínimo 6 caracteres';
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
            if (value && value.length < 2) {
                isValid = false;
                message = 'Nombre muy corto';
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
    field.style.borderColor = '#e1e8ed';
    
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
        background-color: #fee;
        color: #c53030;
        border: 1px solid #fed7d7;
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

// Validar email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
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
    
    .fa-spinner {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(authStyle);
//
 Mostrar mensaje de éxito
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
        background-color: #f0fff4;
        color: #38a169;
        border: 1px solid #c6f6d5;
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

// Resetear botón de autenticación
function resetAuthButton() {
    const submitBtn = document.querySelector('.btn-auth');
    if (submitBtn) {
        submitBtn.disabled = false;
        if (submitBtn.id === 'loginBtn' || document.querySelector('#loginForm')) {
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

// Agregar animación adicional
const additionalStyle = document.createElement('style');
additionalStyle.textContent = `
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
`;
document.head.appendChild(additionalStyle);