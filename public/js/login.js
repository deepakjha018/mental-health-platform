class LoginManager {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.togglePassword = document.querySelector('.toggle-password');
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.socialButtons = document.querySelectorAll('.btn-social');

        this.bindEvents();
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        this.socialButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSocialLogin(e));
        });

        // Real-time validation
        this.emailInput.addEventListener('blur', () => this.validateEmail());
        this.passwordInput.addEventListener('input', () => this.validatePassword());
    }

    async handleSubmit(e) {
        e.preventDefault();
        if (!this.validateForm()) return;
        this.setLoadingState(true);

        try {
            // Simulating API call - replace with your actual backend endpoint
            const response = await this.loginUser(this.emailInput.value, this.passwordInput.value);
            
            if (response.success) {
                // Store user data in localStorage
                localStorage.setItem('userSession', JSON.stringify({
                    isLoggedIn: true,
                    username: response.username,
                    email: this.emailInput.value
                }));
                
                this.showSuccessMessage('Login successful!');
                window.location.href = '/index1.html';
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoadingState(false);
        }
    }

    // Add this method to simulate login (replace with actual API call)
    async loginUser(email, password) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo - check if user exists in localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            return { success: true, username: user.username };
        }
        throw new Error('Invalid credentials');
    }

    validateForm() {
        let isValid = true;

        if (!this.validateEmail()) isValid = false;
        if (!this.validatePassword()) isValid = false;

        return isValid;
    }

    validateEmail() {
        const email = this.emailInput.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            this.showInputError(this.emailInput, 'Email is required');
            return false;
        }

        if (!emailRegex.test(email)) {
            this.showInputError(this.emailInput, 'Please enter a valid email');
            return false;
        }

        this.clearInputError(this.emailInput);
        return true;
    }

    validatePassword() {
        const password = this.passwordInput.value;

        if (!password) {
            this.showInputError(this.passwordInput, 'Password is required');
            return false;
        }

        if (password.length < 6) {
            this.showInputError(this.passwordInput, 'Password must be at least 6 characters');
            return false;
        }

        this.clearInputError(this.passwordInput);
        return true;
    }

    togglePasswordVisibility() {
        const type = this.passwordInput.type === 'password' ? 'text' : 'password';
        this.passwordInput.type = type;
        
        const icon = this.togglePassword.querySelector('i');
        icon.className = `fas fa-${type === 'password' ? 'eye' : 'eye-slash'}`;
    }

    async handleSocialLogin(e) {
        const provider = e.currentTarget.classList.contains('btn-google') ? 'google' : 'facebook';
        
        try {
            window.location.href = `/api/auth/${provider}`;
        } catch (error) {
            this.showError('Social login failed. Please try again.');
        }
    }

    showInputError(input, message) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.add('error');
        
        let errorMessage = formGroup.querySelector('.error-message');
        if (!errorMessage) {
            errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            formGroup.appendChild(errorMessage);
        }
        errorMessage.textContent = message;
    }

    clearInputError(input) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.remove('error');
        
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    setLoadingState(isLoading) {
        this.submitButton.disabled = isLoading;
        this.submitButton.classList.toggle('loading', isLoading);
    }

    showSuccessMessage(message) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'success-message';
        msgDiv.textContent = message;
        this.form.insertBefore(msgDiv, this.form.firstChild);
        setTimeout(() => msgDiv.remove(), 3000);
    }

    showError(message) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'error-message';
        msgDiv.textContent = message;
        this.form.insertBefore(msgDiv, this.form.firstChild);
        setTimeout(() => msgDiv.remove(), 3000);
    }
}

// Initialize login manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');

    togglePassword.addEventListener('click', () => {
        const passwordInput = document.getElementById('password');
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePassword.querySelector('i').classList.toggle('fa-eye');
        togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await Auth.login(email, password);
            if (response.success) {
                Auth.showMessage('success', 'Login successful! Redirecting...', loginForm);
                setTimeout(() => window.location.href = '/dashboard.html', 1500);
            } else {
                Auth.showMessage('error', response.message || 'Login failed', loginForm);
            }
        } catch (error) {
            Auth.showMessage('error', error.message, loginForm);
        }
    });
});