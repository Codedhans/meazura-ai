

app.use(cors({
    origin: '*', // Allows all origins (GitHub, local, mobile)
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add a log right inside the /chat route
app.post('/chat', async (req, res) => {
    console.log("Request received from mobile!"); 
    // ... rest of your code
});
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; // If using older Node, or just use global fetch in Node 18+

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allows your frontend to talk to this server
app.use(express.json());

// AI Chat Route
app.post('/chat', async (req, res) => {
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
            res.json({ output: data.choices[0].message.content });
        } else {
            res.status(500).json({ error: "API Error", details: data });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
app.get('/', (req, res) => {
    res.send("Meazura AI Backend is Running!");
});
