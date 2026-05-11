const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

module.exports = async (req, res) => {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { messages } = req.body;
        
        const response = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: messages,
        });

        // Vercel needs a formal status(200) to close the connection
        res.status(200).json({ output: response.choices[0].message.content });
    } catch (error) {
        console.error("Groq API Error:", error);
        res.status(500).json({ error: error.message });
    }
};
