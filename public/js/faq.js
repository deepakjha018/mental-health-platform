class FAQManager {
    constructor() {
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.searchInput = document.getElementById('faqSearch');
        this.categoryButtons = document.querySelectorAll('.category-btn');
        this.faqItems = document.querySelectorAll('.faq-item');
        this.faqCategories = document.querySelectorAll('.faq-category');
    }

    bindEvents() {
        // Search functionality
        this.searchInput.addEventListener('input', () => this.handleSearch());

        // Category switching
        this.categoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchCategory(e));
        });

        // FAQ item expansion
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => this.toggleFAQ(item));
        });

        // Initialize chat if needed
        const chatButton = document.querySelector('.btn-chat');
        if (chatButton) {
            chatButton.addEventListener('click', () => this.startChat());
        }
    }

    handleSearch() {
        const searchTerm = this.searchInput.value.toLowerCase();
        
        this.faqItems.forEach(item => {
            const question = item.querySelector('h3').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();
            
            const matches = question.includes(searchTerm) || answer.includes(searchTerm);
            item.style.display = matches ? 'block' : 'none';
        });

        // Show all categories during search
        if (searchTerm) {
            this.faqCategories.forEach(category => {
                category.style.display = 'block';
            });
            this.categoryButtons.forEach(btn => {
                btn.classList.remove('active');
            });
        } else {
            // Reset to default view
            this.switchCategory({ target: document.querySelector('.category-btn.active') });
        }
    }

    switchCategory(e) {
        const selectedCategory = e.target.dataset.category;

        // Update active button
        this.categoryButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === selectedCategory);
        });

        // Show/hide categories
        this.faqCategories.forEach(category => {
            category.style.display = category.id === selectedCategory ? 'block' : 'none';
        });

        // Reset search
        this.searchInput.value = '';
        this.faqItems.forEach(item => {
            item.style.display = 'block';
        });
    }

    toggleFAQ(item) {
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.fa-chevron-down');
        const isExpanded = answer.style.maxHeight;

        // Close all other FAQs
        this.faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                const otherAnswer = otherItem.querySelector('.faq-answer');
                const otherIcon = otherItem.querySelector('.fa-chevron-down');
                otherAnswer.style.maxHeight = null;
                otherIcon.style.transform = 'rotate(0deg)';
            }
        });

        // Toggle current FAQ
        if (isExpanded) {
            answer.style.maxHeight = null;
            icon.style.transform = 'rotate(0deg)';
        } else {
            answer.style.maxHeight = answer.scrollHeight + 'px';
            icon.style.transform = 'rotate(180deg)';
        }
    }

    startChat() {
        // Create chat window
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

        // Bind chat events
        const closeBtn = chatContainer.querySelector('.btn-close');
        const minimizeBtn = chatContainer.querySelector('.btn-minimize');
        const sendBtn = chatContainer.querySelector('.btn-send');
        const textarea = chatContainer.querySelector('textarea');

        closeBtn.addEventListener('click', () => chatContainer.remove());
        
        minimizeBtn.addEventListener('click', () => {
            chatContainer.classList.toggle('minimized');
            minimizeBtn.textContent = chatContainer.classList.contains('minimized') ? '+' : '−';
        });

        sendBtn.addEventListener('click', () => this.sendChatMessage(chatContainer, textarea));

        textarea.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendChatMessage(chatContainer, textarea);
            }
        });
    }

    sendChatMessage(chatContainer, textarea) {
        const message = textarea.value.trim();
        if (!message) return;

        const messagesContainer = chatContainer.querySelector('.chat-messages');
        
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'message user';
        userMessage.textContent = message;
        messagesContainer.appendChild(userMessage);

        // Clear input
        textarea.value = '';

        // Simulate response
        setTimeout(() => {
            const agentMessage = document.createElement('div');
            agentMessage.className = 'message agent';
            agentMessage.textContent = 'Thank you for your message. One of our support agents will respond shortly.';
            messagesContainer.appendChild(agentMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1000);
    }
}

// Initialize FAQ manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FAQManager();

    const faqItems = document.querySelectorAll('.faq-item');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const faqCategories = document.querySelectorAll('.faq-category');

    faqItems.forEach(item => {
        item.querySelector('.faq-question').addEventListener('click', () => {
            item.classList.toggle('active');
        });
    });

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.dataset.category;
            faqCategories.forEach(cat => {
                cat.style.display = cat.id === category ? 'block' : 'none';
            });
        });
    });
});

function startChat() {
    alert('Starting live chat...');
}