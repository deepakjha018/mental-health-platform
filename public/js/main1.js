// Use backend API instead of directly calling Gemini API
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests

// API endpoint to handle chatbot messages
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: "Message is required" });
    }

    // Dummy response for now (replace this with Gemini API logic later)
    const botResponse = `You said: ${userMessage}`;
    res.json({ response: botResponse });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const API_URL = '/api/chat'; // Backend endpoint instead of direct Gemini API call

let conversationHistory = [];

// Get DOM elements 
const chatlogs = document.getElementById("chatlogs"); const userInput = document.getElementById("userInput"); const sendBtn = document.getElementById("sendBtn");

console.log('Elements:', { chatlogs, userInput, sendBtn });

// Function to add message to chat 
function addMessage(message, sender) { if (!chatlogs) { console.error('Chatlogs element not found!'); return; }

const messageDiv = document.createElement("div");
messageDiv.classList.add("message", `${sender}-message`);

const messageContent = document.createElement("div");
messageContent.classList.add("message-content");

const senderName = document.createElement("div");
senderName.classList.add("sender-name");
senderName.textContent = sender === "user" ? "You" : "Jarvis";

const messageText = document.createElement("div");
messageText.classList.add("message-text");
messageText.textContent = message;

messageContent.appendChild(senderName);
messageContent.appendChild(messageText);
messageDiv.appendChild(messageContent);

chatlogs.appendChild(messageDiv);
chatlogs.scrollTop = chatlogs.scrollHeight;

}

// Function to check local responses first 
function getLocalResponse(userMessage) { if (!window.chatbotData) { console.warn("chatbotData is not defined"); return null; }

const lowercaseMessage = userMessage.toLowerCase();
for (const keyword in chatbotData) {
    if (lowercaseMessage.includes(keyword.toLowerCase())) {
        const { response, solutions } = chatbotData[keyword];
        let botMessage = response;
        if (solutions && solutions.length > 0) {
            botMessage += "\n\n" + solutions.map((s, i) => `${i + 1}. ${s}`).join("\n");
        }
        return botMessage;
    }
}
return null;

}

// Function to get response from backend API 
async function getGeminiResponse(userMessage) { try { console.log('Calling Backend API...'); const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: userMessage }) });

if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Backend response:', data);
    return data?.response || "I couldn't process your request.";
} catch (error) {
    console.error('Error:', error);
    return "I apologize, but I'm having trouble connecting right now. Please try again later. - Jarvis";
}

}

// Handle message sending 
async function handleMessage(userMessage) { if (!userMessage.trim()) return; console.log('Handling message:', userMessage); addMessage(userMessage, "user");

try {
    const localResponse = getLocalResponse(userMessage);
    const response = localResponse || await getGeminiResponse(userMessage);
    addMessage(response, "bot");
} catch (error) {
    console.error('Error in handleMessage:', error);
    addMessage("I apologize, but I encountered an error. Please try again. - Jarvis", "bot");
}

}

// Event listener for send button
if (sendBtn) { sendBtn.addEventListener("click", async function() { const message = userInput.value.trim(); if (message) { await handleMessage(message); userInput.value = ""; } }); }

// Event listener for Enter key 
if (userInput) { userInput.addEventListener("keypress", async function(e) { if (e.key === "Enter" && userInput.value.trim()) { await handleMessage(userInput.value.trim()); userInput.value = ""; } }); }

// Initial greeting 
document.addEventListener('DOMContentLoaded', () => { console.log('Page loaded, adding initial greeting'); addMessage("Hello! I'm Jarvis, your mental health support assistant. How can I help you today?", "bot"); });