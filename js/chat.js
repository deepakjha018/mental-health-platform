class Chat {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
        this.typing = false;
        this.typingTimeout = null;
        this.socket = io('http://localhost:3000');
        this.currentRoom = 'depression_support';
        this.selectedUser = null;
        this.username = prompt('Enter your username:');
        
        this.initializeEventListeners();
        this.setupSocketListeners();
        this.joinChat();
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            } else {
                this.handleTyping();
            }
        });
    }

    handleTyping() {
        if (!this.typing) {
            this.typing = true;
            // Emit typing event to other users
        }

        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.typing = false;
            // Emit stopped typing event
        }, 1000);
    }

    formatMessage(message) {
        // Convert URLs to clickable links
        message = message.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank">$1</a>'
        );

        // Convert emoticons to emojis
        const emoticons = {
            ':)': '😊',
            ':(': '😢',
            ':D': '😃',
            ';)': '😉',
        };

        for (let emoticon in emoticons) {
            message = message.replace(
                new RegExp(emoticon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                emoticons[emoticon]
            );
        }

        return message;
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        const formattedMessage = this.formatMessage(message);
        
        if (this.selectedUser) {
            // Private message
            this.socket.emit('private_message', {
                to: this.selectedUser,
                message: formattedMessage
            });
        } else {
            // Group message
            this.socket.emit('group_message', {
                room: this.currentRoom,
                message: formattedMessage
            });
        }

        this.addMessageToChat(formattedMessage, true);
        this.messageInput.value = '';
    }

    addMessageToChat(message, isSent, from = 'Support Group') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
        
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        
        messageDiv.innerHTML = `
            <strong>${isSent ? 'You' : from}:</strong> 
            ${message}
            <div class="message-time">
                ${time}
                ${isSent ? '<i class="fas fa-check" style="font-size: 0.8em; margin-left: 5px;"></i>' : ''}
            </div>
        `;
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

        // Add animation
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        });
    }

    setupSocketListeners() {
        this.socket.on('users_updated', (users) => {
            this.updateUserList(users);
        });

        this.socket.on('private_message', (data) => {
            if (!document.querySelector(`[data-username="${data.from}"]`)) {
                this.addUserToList({
                    username: data.from,
                    avatar: data.from.substring(0, 2).toUpperCase()
                });
            }
            this.addMessageToChat(data.message, false, data.from);
        });

        this.socket.on('group_message', (data) => {
            if (data.from !== this.username) {
                this.addMessageToChat(data.message, false, data.from);
            }
        });
    }

    joinChat() {
        if (!this.username) {
            this.username = prompt('Please enter your username:');
        }
        this.socket.emit('user_join', { username: this.username });
    }

    updateUserList(users) {
        const userList = document.querySelector('.user-list');
        userList.innerHTML = users
            .filter(user => user.username !== this.username)
            .map(user => `
                <li class="user-item" data-username="${user.username}">
                    <div class="user-avatar">${user.username.substring(0, 2).toUpperCase()}</div>
                    <div class="user-info">
                        <div class="user-name">${user.username}</div>
                        <div class="user-status"></div>
                    </div>
                </li>
            `).join('');

        this.addUserListListeners();
    }

    addUserListListeners() {
        document.querySelectorAll('.user-item').forEach(item => {
            item.addEventListener('click', () => {
                const username = item.dataset.username;
                this.selectedUser = username;
                
                // Update header to show private chat
                const header = document.querySelector('.chat-header h2');
                header.textContent = `Chat with ${username}`;
                
                // Clear messages when switching chats
                this.chatMessages.innerHTML = '';
            });
        });
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const chat = new Chat();
});
