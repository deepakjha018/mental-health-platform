document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');

    // Store messages in local storage
    let messages = JSON.parse(localStorage.getItem('chatMessages')) || [];

    // Function to create a message element
    function createMessageElement(message, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = message;

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString();

        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);

        return messageDiv;
    }

    // Function to add a message to the chat
    function addMessage(message, isUser = true) {
        const messageElement = createMessageElement(message, isUser);
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Save to local storage
        messages.push({ text: message, isUser, timestamp: new Date().toISOString() });
        localStorage.setItem('chatMessages', JSON.stringify(messages));

        if (isUser) {
            // Simulate bot response
            setTimeout(() => {
                const responses = [
                    "Thank you for sharing. How does that make you feel?",
                    "I understand this might be difficult. Would you like to talk more about it?",
                    "You're not alone in this. Have you tried any coping strategies?",
                    "That's very insightful. What made you realize this?",
                    "I'm here to listen. Would you like to elaborate on that?"
                ];
                const botResponse = responses[Math.floor(Math.random() * responses.length)];
                addMessage(botResponse, false);
            }, 1000);
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Send message function
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            addMessage(message);
            messageInput.value = '';
        }
    }

    // Load previous messages
    messages.forEach(msg => {
        addMessage(msg.text, msg.isUser);
    });
});
