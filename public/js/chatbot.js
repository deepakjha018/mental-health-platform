// chatbot.js - JavaScript-based chatbot using Google Gemini API

const API_KEY = "AIzaSyCSUE8sAG_ZcRJQOstMDEeXrFdjfDiNsjI"; // Replace with your API Key
const CHAT_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

document.addEventListener("DOMContentLoaded", function () {
    const chatInput = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");
    const chatLogs = document.getElementById("chatlogs");

    // Add message context management
    let messageHistory = [];

    // Initialize with welcome message
    addMessage("bot-message", "Hello! I'm your mental wellness companion. How can I help you today?");

    function addMessage(sender, message) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", sender);
        messageDiv.innerHTML = `
            <div class="message-content">
                <i class="fas ${sender === 'bot-message' ? 'fa-robot' : 'fa-user'}"></i>
                <p>${message}</p>
            </div>`;
        chatLogs.appendChild(messageDiv);
        chatLogs.scrollTop = chatLogs.scrollHeight;
    }

    async function sendMessage() {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        // Disable input and button while processing
        chatInput.disabled = true;
        sendBtn.disabled = true;

        addMessage("user-message", userMessage);
        chatInput.value = "";

        // Update message history
        messageHistory.push({ role: "user", content: userMessage });

        try {
            const response = await fetch(CHAT_URL + "?key=" + API_KEY, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{
                        role: "user",
                        parts: [{
                            text: `You are a mental health support chatbot. Respond to: ${userMessage}
                                  Keep responses supportive, empathetic, and focused on mental wellness.
                                  If user shows signs of crisis, recommend professional help.`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                    safetySettings: [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                              "I apologize, but I'm having trouble understanding. Could you rephrase that?";
            
            messageHistory.push({ role: "assistant", content: botResponse });
            addMessage("bot-message", botResponse);

        } catch (error) {
            console.error("Chat Error:", error);
            addMessage("bot-message", "I'm having trouble connecting right now. Please try again in a moment.");
        } finally {
            // Re-enable input and button
            chatInput.disabled = false;
            sendBtn.disabled = false;
            chatInput.focus();
        }
    }

    // Event listeners
    sendBtn.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    // Add loading indicator
    function showLoadingIndicator() {
        const loadingDiv = document.createElement("div");
        loadingDiv.classList.add("bot-message", "loading");
        loadingDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
        chatLogs.appendChild(loadingDiv);
        chatLogs.scrollTop = chatLogs.scrollHeight;
        return loadingDiv;
    }
});
