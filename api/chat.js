const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: conversationHistory })
});

const data = await response.json();

// Whatever the server sends (even an error), show it in the chat
if (data.output) {
    appendMessage('bot', data.output);
    conversationHistory.push({ role: "assistant", content: data.output });
}
