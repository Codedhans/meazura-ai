import OpenAI from 'openai';

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

        const completion = await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: messages,
        });

        const aiResponse = completion.choices[0].message.content;

        // Send back the response in the format your frontend expects
        return res.status(200).json({ output: aiResponse });

    } catch (error) {
        console.error("Vercel Function Error:", error);
        return res.status(500).json({ 
            error: "AI failed to respond", 
            details: error.message 
        });
    }
                                    }
