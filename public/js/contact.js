class ContactManager {
    constructor() {
        this.initializeForm();
        this.bindEvents();
        this.chatWindow = null;
    }

    initializeForm() {
        this.form = document.getElementById('contactForm');
        this.formFields = {
            name: document.getElementById('name'),
            email: document.getElementById('email'),
            subject: document.getElementById('subject'),
            message: document.getElementById('message')
        };
    }

    bindEvents() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Live chat button
        const chatButton = document.querySelector('.btn-chat');
        if (chatButton) {
            chatButton.addEventListener('click', () => this.startChat());
        }

        // Form field validation
        Object.values(this.formFields).forEach(field => {
            if (field) {
                field.addEventListener('blur', () => this.validateField(field));
            }
        });
    }

    handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            this.showMessage('Please fill in all required fields correctly.', 'error');
            return;
        }

        const formData = {
            name: this.formFields.name.value,
            email: this.formFields.email.value,
            subject: this.formFields.subject.value,
            message: this.formFields.message.value,
            timestamp: new Date().toISOString()
        };

        // Simulate API call to submit form
        this.showMessage('Sending your message...', 'info');
        
        setTimeout(() => {
            // In a real implementation, this would be an API call
            console.log('Form submission:', formData);
            this.showMessage('Message sent successfully!', 'success');
            this.form.reset();
        }, 1000);
    }

    validateForm() {
        let isValid = true;
        Object.values(this.formFields).forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        return isValid;
    }

    validateField(field) {
        if (!field.value.trim()) {
            this.showFieldError(field, 'This field is required');
            return false;
        }

        if (field.type === 'email' && !this.isValidEmail(field.value)) {
            this.showFieldError(field, 'Please enter a valid email address');
            return false;
        }

        this.clearFieldError(field);
        return true;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        field.classList.add('error');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        
        field.parentNode.appendChild(errorElement);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    startChat() {
        if (this.chatWindow) {
            this.chatWindow.focus();
            return;
        }

        const chatContainer = document.createElement('div');
        chatContainer.className = 'chat-window';
        
        chatContainer.innerHTML = `
            <div class="chat-header">
                <h4>Live Support Chat</h4>
                <button class="btn-minimize">−</button>
                <button class="btn-close">×</button>
            </div>
            <div class="chat-messages">
                <div class="message system">
                    Welcome to Neuro Nurture Support! How can we help you today?
                </div>
            </div>
            <div class="chat-input">
                <textarea placeholder="Type your message..."></textarea>
                <button class="btn-send">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;

        document.body.appendChild(chatContainer);
        this.chatWindow = chatContainer;

        // Bind chat events
        const closeBtn = chatContainer.querySelector('.btn-close');
        const minimizeBtn = chatContainer.querySelector('.btn-minimize');
        const sendBtn = chatContainer.querySelector('.btn-send');
        const textarea = chatContainer.querySelector('textarea');

        closeBtn.addEventListener('click', () => {
            chatContainer.remove();
            this.chatWindow = null;
        });

        minimizeBtn.addEventListener('click', () => {
            chatContainer.classList.toggle('minimized');
            minimizeBtn.textContent = chatContainer.classList.contains('minimized') ? '+' : '−';
        });

        sendBtn.addEventListener('click', () => this.sendChatMessage(textarea));

        textarea.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendChatMessage(textarea);
            }
        });
    }

    sendChatMessage(textarea) {
        const message = textarea.value.trim();
        if (!message) return;

        const messagesContainer = this.chatWindow.querySelector('.chat-messages');
        
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'message user';
        userMessage.textContent = message;
        messagesContainer.appendChild(userMessage);

        // Clear input
        textarea.value = '';

        // Simulate response (in real implementation, this would connect to a chat service)
        setTimeout(() => {
            const agentMessage = document.createElement('div');
            agentMessage.className = 'message agent';
            agentMessage.textContent = 'Thank you for your message. One of our support agents will respond shortly.';
            messagesContainer.appendChild(agentMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1000);
    }

    showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `message-popup message-${type}`;
        messageElement.textContent = message;
        
        document.body.appendChild(messageElement);

        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
}

// Initialize contact manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ContactManager();
}); 