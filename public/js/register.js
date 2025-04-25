class RegisterManager {
    constructor() {
        this.form = document.getElementById('registerForm');
        this.errorMessage = document.getElementById('errorMessage');
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleRegister(e));
        
        // Password visibility toggle
        const toggleBtn = document.querySelector('.toggle-password');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const password = document.getElementById('password');
                const type = password.type === 'password' ? 'text' : 'password';
                password.type = type;
                toggleBtn.innerHTML = `<i class="fas fa-${type === 'password' ? 'eye' : 'eye-slash'}"></i>`;
            });
        }

        // Password strength meter
        const password = document.getElementById('password');
        if (password) {
            password.addEventListener('input', (e) => this.updatePasswordStrength(e.target.value));
        }

        // Real-time validation
        const inputs = {
            username: { min: 3, message: 'Username must be at least 3 characters' },
            email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email' },
            password: { min: 8, message: 'Password must be at least 8 characters' }
        };

        Object.keys(inputs).forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('blur', () => this.validateField(input, inputs[id]));
            }
        });

        // Password confirmation validation
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('blur', () => {
                const password = document.getElementById('password').value;
                if (confirmPassword.value !== password) {
                    this.showFieldError(confirmPassword, 'Passwords do not match');
                } else {
                    this.clearFieldError(confirmPassword);
                }
            });
        }
    }

    async handleRegister(e) {
        e.preventDefault();

        try {
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const terms = document.querySelector('input[name="terms"]').checked;

            if (!this.validateForm(username, email, password, confirmPassword, terms)) {
                return;
            }

            console.log('Attempting registration...'); // Debug log
            
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();
            console.log('Registration response:', data); // Debug log

            if (data.success) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                this.showSuccess('Registration successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                throw new Error(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showError('Server error: ' + error.message);
        }
    }

    validateForm(username, email, password, confirmPassword, terms) {
        if (username.length < 3) {
            this.showError('Username must be at least 3 characters');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('Please enter a valid email address');
            return false;
        }

        if (password.length < 8) {
            this.showError('Password must be at least 8 characters');
            return false;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return false;
        }

        if (!terms) {
            this.showError('Please accept the Terms of Service');
            return false;
        }

        return true;
    }

    validateField(input, rules) {
        const value = input.value;
        
        if (rules.min && value.length < rules.min) {
            this.showFieldError(input, rules.message);
            return false;
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
            this.showFieldError(input, rules.message);
            return false;
        }
        
        this.clearFieldError(input);
        return true;
    }

    updatePasswordStrength(password) {
        const strengthMeter = document.querySelector('.strength-meter');
        const strengthText = document.querySelector('.strength-text');
        
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/)) strength++;
        if (password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;

        const strengthLabels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
        const strengthColors = ['#ff4444', '#ffbb33', '#ffeb3b', '#00C851', '#007E33'];

        strengthMeter.style.width = `${(strength / 5) * 100}%`;
        strengthMeter.style.backgroundColor = strengthColors[strength - 1];
        strengthText.textContent = `Password strength: ${strengthLabels[strength - 1]}`;
    }

    showFieldError(input, message) {
        const formGroup = input.closest('.form-group');
        let errorDiv = formGroup.querySelector('.field-error');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            formGroup.appendChild(errorDiv);
        }
        
        formGroup.classList.add('error');
        errorDiv.textContent = message;
    }

    clearFieldError(input) {
        const formGroup = input.closest('.form-group');
        const errorDiv = formGroup.querySelector('.field-error');
        
        formGroup.classList.remove('error');
        if (errorDiv) errorDiv.remove();
    }

    showError(message) {
        if (this.errorMessage) {
            this.errorMessage.textContent = message;
            this.errorMessage.style.display = 'block';
            setTimeout(() => {
                this.errorMessage.style.display = 'none';
            }, 3000);
        }
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        this.form.insertBefore(successDiv, this.form.firstChild);
    }

    showMessage(type, message) {
        const existingMsg = this.form.querySelector('.message');
        if (existingMsg) existingMsg.remove();

        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}-message`;
        msgDiv.textContent = message;
        this.form.insertBefore(msgDiv, this.form.firstChild);

        if (type === 'error') {
            setTimeout(() => msgDiv.remove(), 3000);
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new RegisterManager();
});