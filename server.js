import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// Serve Vite build output
const frontendFolder = "dist";
app.use(express.static(path.join(__dirname, frontendFolder)));

// API route
app.post("/api/clanker-reply", async (req, res) => {
  const { clankerId, userText } = req.body;
  const persona = `You are ${clankerId}, a factual assistant. Avoid sound effects and stay focused on clear answers.`;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: persona },
          { role: "user", content: userText },
        ],
      }),
    });

    const data = await groqRes.json();
    let reply = data?.choices?.[0]?.message?.content
      || data?.choices?.[0]?.text
      || data?.error?.message
      || "No reply from Groq.";

    res.json({ reply });
  } catch (err) {
    console.error("Groq API error:", err);
    res.status(500).json({ reply: "Error talking to Groq API." });
  }
});

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, frontendFolder, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Clanker rattling on port ${PORT}`);
});
