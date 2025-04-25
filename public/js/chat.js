// Chat initialization
document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    let isTyping = false;
    let typingTimeout = null;

    // Initialize from config
    const { groupName, groupId, members, sampleMessages } = chatConfig;
    
    // DOM elements
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const typingIndicator = document.querySelector('.typing-indicator');
    const searchInput = document.querySelector('.search-input');

    // Initialize messages
    if (sampleMessages?.length > 0) {
        renderMessages(sampleMessages);
    }

    // Message handling
    function renderMessages(messages) {
        chatMessages.innerHTML = messages.map(msg => `
            <div class="message ${msg.type}">
                <div class="user-avatar">${msg.avatar}</div>
                <div class="message-content">
                    <div class="message-sender">${msg.sender}</div>
                    <div class="message-text">${msg.content}</div>
                    <div class="message-time">${msg.timestamp}</div>
                </div>
            </div>
        `).join('');
        scrollToBottom();
    }

    function createMessage(message) {
        return `
            <div class="message ${message.type}">
                <div class="user-avatar">${message.avatar}</div>
                <div class="message-content">
                    <div class="message-sender">${message.sender}</div>
                    <div class="message-text">${message.content}</div>
                    <div class="message-time">${message.timestamp}</div>
                </div>
            </div>
        `;
    }

    function addMessage(message) {
        chatMessages.insertAdjacentHTML('beforeend', createMessage(message));
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function sendMessage() {
        const content = messageInput.value.trim();
        if (!content) return;

        const message = {
            content,
            sender: 'You',
            avatar: 'ME',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'sent',
            groupId
        };

        addMessage(message);
        socket.emit('message', message);
        messageInput.value = '';
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
            return;
        }

        if (!isTyping) {
            socket.emit('typing', { groupId, status: true });
            isTyping = true;
        }

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit('typing', { groupId, status: false });
            isTyping = false;
        }, 2000);
    });

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            document.querySelectorAll('.user-item').forEach(item => {
                const userName = item.querySelector('.user-name').textContent.toLowerCase();
                item.style.display = userName.includes(searchTerm) ? 'flex' : 'none';
            });
        });
    }

    // Socket events
    socket.emit('joinGroup', groupId);

    socket.on('message', (message) => {
        if (message.groupId === groupId) {
            addMessage({ ...message, type: 'received' });
        }
    });

    socket.on('typing', (data) => {
        if (data.groupId === groupId && typingIndicator) {
            typingIndicator.style.display = data.status ? 'block' : 'none';
            typingIndicator.textContent = data.status ? 'Someone is typing...' : '';
        }
    });

    // Mobile responsiveness
    const sidebar = document.querySelector('.sidebar');
    const menuButton = document.createElement('button');
    menuButton.className = 'menu-button';
    menuButton.innerHTML = '<i class="fas fa-bars"></i>';
    document.querySelector('.chat-header').prepend(menuButton);

    menuButton.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
});
