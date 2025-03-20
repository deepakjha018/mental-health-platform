class RegisterManager {
    constructor() {
        this.form = document.getElementById('registerForm');
        this.initializeForm();
        this.API_URL = 'http://localhost:3000/api';
    }

    initializeForm() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Password visibility toggle
        const toggleBtn = document.querySelector('.toggle-password');
        toggleBtn.addEventListener('click', () => {
            const password = document.getElementById('password');
            const type = password.type === 'password' ? 'text' : 'password';
            password.type = type;
            toggleBtn.innerHTML = `<i class="fas fa-${type === 'password' ? 'eye' : 'eye-slash'}"></i>`;
        });

        // Add real-time validation
        document.getElementById('username').addEventListener('blur', (e) => this.validateUsername(e.target));
        document.getElementById('email').addEventListener('blur', (e) => this.validateEmail(e.target));
        document.getElementById('password').addEventListener('input', (e) => this.validatePassword(e.target));
        document.getElementById('confirmPassword').addEventListener('input', (e) => this.validateConfirmPassword(e.target));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value
        };

        if (!this.validateForm(formData)) {
            return;
        }

        try {
            const response = await fetch(`${this.API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                this.showSuccess('Registration successful! Redirecting to login...');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
            } else {
                this.showError(data.message || 'Registration failed');
            }
        } catch (error) {
            this.showError('Server error. Please try again later.');
            console.error('Registration error:', error);
        }
    }

    validateForm(data) {
        let isValid = true;

        if (!this.validateUsername(document.getElementById('username'))) isValid = false;
        if (!this.validateEmail(document.getElementById('email'))) isValid = false;
        if (!this.validatePassword(document.getElementById('password'))) isValid = false;
        if (!this.validateConfirmPassword(document.getElementById('confirmPassword'))) isValid = false;

        return isValid;
    }

    validateUsername(input) {
        if (input.value.length < 3) {
            this.showFieldError(input, 'Username must be at least 3 characters');
            return false;
        }
        this.clearFieldError(input);
        return true;
    }

    validateEmail(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value)) {
            this.showFieldError(input, 'Please enter a valid email');
            return false;
        }
        this.clearFieldError(input);
        return true;
    }

    validatePassword(input) {
        if (input.value.length < 8) {
            this.showFieldError(input, 'Password must be at least 8 characters');
            return false;
        }
        this.clearFieldError(input);
        return true;
    }

    validateConfirmPassword(input) {
        const password = document.getElementById('password').value;
        if (input.value !== password) {
            this.showFieldError(input, 'Passwords do not match');
            return false;
        }
        this.clearFieldError(input);
        return true;
    }

    showFieldError(input, message) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.add('error');
        
        let errorDiv = formGroup.querySelector('.field-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            formGroup.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
    }

    clearFieldError(input) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.remove('error');
        const errorDiv = formGroup.querySelector('.field-error');
        if (errorDiv) errorDiv.remove();
    }

    showSuccess(message) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'success-message';
        msgDiv.textContent = message;
        this.form.insertBefore(msgDiv, this.form.firstChild);
    }

    showError(message) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'error-message';
        msgDiv.textContent = message;
        this.form.insertBefore(msgDiv, this.form.firstChild);
        setTimeout(() => msgDiv.remove(), 3000);
    }
}

// Initialize register manager
document.addEventListener('DOMContentLoaded', () => {
    new RegisterManager();

    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const strengthMeter = document.querySelector('.strength-meter');
    const strengthText = document.querySelector('.strength-text');

    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/)) strength++;
        if (password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;

        strengthMeter.style.width = `${(strength / 5) * 100}%`;
        strengthMeter.style.background = ['red', 'orange', 'yellow', 'lightgreen', 'green'][strength - 1];
        strengthText.textContent = `Password strength: ${['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'][strength - 1]}`;
    };

    passwordInput.addEventListener('input', () => checkPasswordStrength(passwordInput.value));

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (passwordInput.value !== confirmPasswordInput.value) {
            Auth.showMessage('error', 'Passwords do not match', registerForm);
            return;
        }

        const userData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            password: passwordInput.value
        };

        try {
            const response = await Auth.register(userData);
            if (response.success) {
                Auth.showMessage('success', 'Registration successful! Redirecting to login...', registerForm);
                setTimeout(() => window.location.href = '/login.html', 1500);
            } else {
                Auth.showMessage('error', response.message || 'Registration failed', registerForm);
            }
        } catch (error) {
            Auth.showMessage('error', error.message, registerForm);
        }
    });
});