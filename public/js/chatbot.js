// chatbot.js - JavaScript-based chatbot using Google Gemini API

const API_KEY = "AIzaSyCSUE8sAG_ZcRJQOstMDEeXrFdjfDiNsjI"; // Replace with your API Key
const CHAT_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

document.addEventListener("DOMContentLoaded", function () {
    const chatInput = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");
    const chatLogs = document.getElementById("chatlogs");

    function addMessage(sender, message) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add(sender);
        messageDiv.innerHTML = `<p>${message}</p>`;
        chatLogs.appendChild(messageDiv);
        chatLogs.scrollTop = chatLogs.scrollHeight;
    }

    function sendMessage() {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        addMessage("user-message", userMessage);
        chatInput.value = "";

        fetch(CHAT_URL + "?key=" + API_KEY, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userMessage }] }],
            }),
        })
        .then(response => response.json())
        .then(data => {
            const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand.";
            addMessage("bot-message", botResponse);
        })
        .catch(error => {
            console.error("Error:", error);
            addMessage("bot-message", "Error: Unable to connect to the chatbot.");
        });
    }

    sendBtn.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") sendMessage();
    });
});
