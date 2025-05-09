const API_URL = 'http://localhost:3000/api';

class Auth {
    static async checkAuthStatus() {
        try {
            const response = await fetch('/api/user', {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.authenticated) {
                this.updateNavBar(data.user);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Auth check failed:', error);
            return false;
        }
    }

    static updateNavBar(user) {
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');
        const username = document.getElementById('username');

        if (user) {
            loginBtn.style.display = 'none';
            userMenu.style.display = 'block';
            username.textContent = user.username;
        } else {
            loginBtn.style.display = 'block';
            userMenu.style.display = 'none';
        }
    }

    static async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            if (data.success) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                return { success: true, user: data.user };
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    static async register(userData) {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            if (data.success) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                return { success: true, user: data.user };
            } else {
                throw new Error(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    }

    static async logout() {
        try {
            await fetch('http://localhost:3000/api/logout', {
                method: 'POST',
                credentials: 'include'
            });
            localStorage.removeItem('currentUser');
            return true;
        } catch (error) {
            return false;
        }
    }

    static isLoggedIn() {
        return !!localStorage.getItem('currentUser');
    }

    static getUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    static showMessage(type, message, container) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = message;
        
        // Find the form element in the container
        const form = container.querySelector('form');
        if (form) {
            form.insertBefore(messageDiv, form.firstChild);
        } else {
            container.insertBefore(messageDiv, container.firstChild);
        }

        setTimeout(() => messageDiv.remove(), 5000);
    }
}

class AuthManager {
    constructor() {
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        // Login form elements
        this.loginForm = document.getElementById('loginForm');
        this.resetForm = document.getElementById('resetForm');
        this.registerForm = document.getElementById('registerForm');

        // Password toggle buttons
        this.passwordToggles = document.querySelectorAll('.toggle-password');

        // Forgot password link
        this.forgotPasswordLink = document.querySelector('.forgot-password');
        this.backToLoginBtn = document.querySelector('.btn-back');

        // Social login buttons
        this.socialButtons = document.querySelectorAll('.btn-social');

        // Password strength meter (registration)
        if (this.registerForm) {
            this.passwordInput = document.getElementById('password');
            this.confirmPasswordInput = document.getElementById('confirmPassword');
            this.strengthMeter = document.querySelector('.strength-meter');
            this.strengthText = document.querySelector('.strength-text');
        }
    }

    bindEvents() {
        // Form submissions
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        if (this.resetForm) {
            this.resetForm.addEventListener('submit', (e) => this.handlePasswordReset(e));
        }
        if (this.registerForm) {
            this.registerForm.addEventListener('submit', (e) => this.handleRegistration(e));
        }

        // Password visibility toggle
        this.passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => this.togglePasswordVisibility(e));
        });

        // Forgot password flow
        if (this.forgotPasswordLink) {
            this.forgotPasswordLink.addEventListener('click', (e) => this.showResetForm(e));
        }
        if (this.backToLoginBtn) {
            this.backToLoginBtn.addEventListener('click', () => this.showLoginForm());
        }

        // Social login
        this.socialButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSocialLogin(e));
        });

        // Password strength check (registration)
        if (this.passwordInput) {
            this.passwordInput.addEventListener('input', () => this.checkPasswordStrength());
            this.confirmPasswordInput.addEventListener('input', () => this.checkPasswordMatch());
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = this.loginForm.email.value;
        const password = this.loginForm.password.value;

        try {
            const data = await Auth.login(email, password);
            if (data.token) {
                localStorage.setItem('token', data.token);
                window.location.href = '/groups/anxiety.html';
            } else {
                Auth.showMessage('error', data.error || 'Login failed', this.loginForm);
            }
        } catch (error) {
            console.error('Login error:', error);
            Auth.showMessage('error', 'Login failed. Please try again.', this.loginForm);
        }
    }

    async handleRegistration(e) {
        e.preventDefault();

        const fullName = this.registerForm.fullName.value;
        const email = this.registerForm.email.value;
        const password = this.registerForm.password.value;
        const confirmPassword = this.registerForm.confirmPassword.value;
        const terms = this.registerForm.terms.checked;

        // Validate input
        if (!this.validateEmail(email)) {
            this.showMessage('Please enter a valid email address', 'error');
            return;
        }

        if (!this.validatePassword(password)) {
            this.showMessage('Password must be at least 8 characters with letters and numbers', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }

        if (!terms) {
            this.showMessage('Please accept the Terms of Service', 'error');
            return;
        }

        try {
            const data = await Auth.register({ fullName, email, password });
            if (data.token) {
                localStorage.setItem('token', data.token);
                window.location.href = '/groups/anxiety.html';
            } else {
                Auth.showMessage('error', data.error || 'Registration failed', this.registerForm);
            }
        } catch (error) {
            console.error('Registration error:', error);
            Auth.showMessage('error', 'Registration failed. Please try again.', this.registerForm);
        }
    }

    handlePasswordReset(e) {
        e.preventDefault();

        const email = this.resetForm.resetEmail.value;

        if (!this.validateEmail(email)) {
            this.showMessage('Please enter a valid email address', 'error');
            return;
        }

        // Simulate API call
        this.showMessage('Sending reset instructions...', 'info');
        
        // In a real implementation, this would be an API call
        setTimeout(() => {
            this.showMessage('Password reset instructions sent to your email!', 'success');
            this.showLoginForm();
        }, 1500);
    }

    handleSocialLogin(e) {
        const provider = e.currentTarget.classList.contains('btn-google') ? 'Google' : 'Facebook';
        
        // Simulate social login
        this.showMessage(`Connecting to ${provider}...`, 'info');
        
        // In a real implementation, this would integrate with social login APIs
        setTimeout(() => {
            this.showMessage('Social login not implemented in demo', 'warning');
        }, 1500);
    }

    togglePasswordVisibility(e) {
        const button = e.currentTarget;
        const input = button.parentElement.querySelector('input');
        const icon = button.querySelector('i');

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    showResetForm(e) {
        e.preventDefault();
        document.querySelector('.auth-box').style.display = 'none';
        document.querySelector('.reset-box').style.display = 'block';
    }

    showLoginForm() {
        document.querySelector('.auth-box').style.display = 'block';
        document.querySelector('.reset-box').style.display = 'none';
    }

    checkPasswordStrength() {
        const password = this.passwordInput.value;
        let strength = 0;
        let feedback = '';

        if (password.length >= 8) strength++;
        if (password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^A-Za-z0-9]/)) strength++;

        this.strengthMeter.className = 'strength-meter';
        switch (strength) {
            case 0:
                feedback = 'Very weak';
                this.strengthMeter.classList.add('very-weak');
                break;
            case 1:
                feedback = 'Weak';
                this.strengthMeter.classList.add('weak');
                break;
            case 2:
                feedback = 'Medium';
                this.strengthMeter.classList.add('medium');
                break;
            case 3:
                feedback = 'Strong';
                this.strengthMeter.classList.add('strong');
                break;
            case 4:
                feedback = 'Very strong';
                this.strengthMeter.classList.add('very-strong');
                break;
        }

        this.strengthText.textContent = `Password strength: ${feedback}`;
    }

    checkPasswordMatch() {
        const password = this.passwordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;

        if (confirmPassword && password !== confirmPassword) {
            this.confirmPasswordInput.classList.add('error');
            this.showMessage('Passwords do not match', 'error');
        } else {
            this.confirmPasswordInput.classList.remove('error');
        }
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    validatePassword(password) {
        return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
    }

    showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `auth-message message-${type}`;
        messageElement.textContent = message;
        
        document.querySelector('.auth-container').appendChild(messageElement);

        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
}

// Initialize authentication manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});

// Initialize auth check on all pages
document.addEventListener('DOMContentLoaded', () => {
    Auth.checkAuthStatus();
    
    // Add logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logout();
        });
    }
});