export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { messages } = req.body;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: messages
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0]) {
            return res.status(200).json({ output: data.choices[0].message.content });
        } else {
            console.error("Groq Error Payload:", data);
            return res.status(500).json({ error: "Invalid response from Groq", details: data });
        }

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
                }
