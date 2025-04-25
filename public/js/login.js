class LoginManager {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.errorMessage = document.getElementById('errorMessage');
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleLogin(e));
        
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

        // Add input validation
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        
        email.addEventListener('blur', () => this.validateEmail(email));
        password.addEventListener('blur', () => this.validatePassword(password));
    }

    validateEmail(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value)) {
            this.showError('Please enter a valid email address');
            return false;
        }
        return true;
    }

    validatePassword(input) {
        if (input.value.length < 6) {
            this.showError('Password must be at least 6 characters');
            return false;
        }
        return true;
    }

    async handleLogin(e) {
        e.preventDefault();

        // Test server connection first
        try {
            const testResponse = await fetch('http://localhost:3000/api/test', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            const testData = await testResponse.json();
            console.log('Server test response:', testData);
            
            if (!testResponse.ok) {
                throw new Error('Server not responding');
            }
        } catch (error) {
            console.error('Server connection error:', error);
            this.showError('Cannot connect to server. Please try again later.');
            return;
        }
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            console.log('Response status:', response.status); // Debug log
            const data = await response.json();
            console.log('Login response:', data); // Debug log

            if (data.success) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                this.showSuccess('Login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = '/dashboard';  // Changed to use the dashboard route
                }, 1500);
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError(error.message);
        }
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

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        this.form.insertBefore(successDiv, this.form.firstChild);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});