import express, { Request, Response } from "express";
import fetch from "node-fetch";
import { AI_BOT_CHARACTER } from "../constants/aiBotCharacter.js";

// Define types for OpenAI API response
interface OpenAIResponse {
  choices: { message: { role: string; content: string } }[];
  error?: { message: string };
}

const router = express.Router();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API key in environment variables.");
}

// Helper to call OpenAI API
async function callOpenAI(
  messages: any[],
  max_tokens: number
): Promise<OpenAIResponse> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens,
    }),
  });

  const data = (await response.json()) as OpenAIResponse;
  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to fetch from OpenAI.");
  }
  return data;
}

// Start a conversation
router.post("/start", async (req: Request, res: Response) => {
  const { username } = req.body;

  try {
    const response = await callOpenAI(
      [
        { role: "system", content: AI_BOT_CHARACTER.chatPrompt },
        { role: "user", content: `Start a conversation. User: ${username}` },
      ],
      150
    );

    res.json(response.choices[0].message.content);
  } catch (error: any) {
    console.error("Error starting conversation:", error);
    res.status(500).json({ error: error.message });
  }
});

// Continue a conversation
router.post("/step", async (req: Request, res: Response) => {
  const { message } = req.body;

  try {
    const response = await callOpenAI(
      [
        { role: "system", content: AI_BOT_CHARACTER.chatPrompt },
        { role: "user", content: message },
      ],
      150
    );

    res.json(response.choices[0].message.content);
  } catch (error: any) {
    console.error("Error continuing conversation:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
