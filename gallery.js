const sendAiBtn = document.getElementById('sendAiBtn');
const aiInput = document.getElementById('aiInput');

// IMPORTANT: Replace this with your actual Render URL
const BACKEND_URL = "https://meazura-ai.onrender.com/chat";

if (sendAiBtn) {
    sendAiBtn.onclick = async () => {
        const query = aiInput.value.trim();
        if (!query) return;

        // 1. Display User Message & Clear Input
        appendMessage('user', query);
        aiInput.value = '';
        conversationHistory.push({ role: "user", content: query });

        // 2. Show Typing Indicator
        const typingId = 'typing-' + Date.now();
        showTyping(typingId);

        try {
            // 3. Render API Call with Timeout Check
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for cold starts

            const response = await fetch(BACKEND_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: conversationHistory }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await response.json();
            document.getElementById(typingId)?.remove();

            // 4. Handle Response
            if (data.output) {
                appendMessage('bot', data.output);
                conversationHistory.push({ role: "assistant", content: data.output });
            } else if (data.error) {
                appendMessage('bot', "Backend error: " + data.error);
                console.error("Server Logic Error:", data);
            }
        } catch (err) {
            document.getElementById(typingId)?.remove();
            
            if (err.name === 'AbortError') {
                appendMessage('bot', "The server is taking a while to wake up. Please wait 30 seconds and try sending that again.");
            } else {
                appendMessage('bot', "Connection failed. Make sure your Render backend is live.");
            }
            console.error("Render Chat Error:", err);
        }
    };
}

// Ensure 'Enter' key logic is clean
if (aiInput) {
    aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevents line breaks in some browsers
            sendAiBtn.click();
        }
    });
}