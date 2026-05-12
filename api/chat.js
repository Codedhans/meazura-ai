import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { messages } = req.body;

        const response = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: messages,
            temperature: 0.7,
        });

        return res.status(200).json({ 
            output: response.choices[0].message.content 
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}