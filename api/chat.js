const OpenAI = require("openai");
const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).send("Method Not Allowed");
    
    try {
        const completion = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: req.body.messages, // Ensure this is an array
        });

        // FIX: Added [0] index to choices
        const aiResponse = completion.choices[0].message.content;

        res.status(200).json({ output: aiResponse });
    } catch (err) {
        console.error("Groq API Error:", err);
        res.status(500).json({ error: err.message });
    }
};

const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: conversationHistory })
});

const data = await response.json();

// Check for 'output' (which matches the serverless function above)
if (data.output) {
    appendMessage('bot', data.output);
    conversationHistory.push({ role: "assistant", content: data.output });
} else if (data.error) {
    appendMessage('bot', "Server Error: " + data.error);
}
