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
// In-memory conversation history
const conversationHistory: Record<string, any[]> = {};

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

// Start a conversation init character and user name
router.post("/start", async (req: Request, res: Response) => {
  const { username, message, indexedHistory } = req.body;

  try {
    if (
      !username ||
      typeof username !== "string" ||
      !message ||
      typeof message !== "string" ||
      !indexedHistory ||
      typeof indexedHistory !== "string"
    ) {
      return;
    }

    const initialPrompt = [
      {
        role: "system",
        content: `You are Sophon! , ${AI_BOT_CHARACTER.chatPrompt} , and you speak with user: ${username} , start conversation`,
      },
      {
        role: "user",
        content: `conversationHistory: ${indexedHistory}, input:${message}`,
      },
    ];
    const response = await callOpenAI(initialPrompt, 150);

    // Save conversation history
    conversationHistory[username] = initialPrompt;

    // Append AI response to the history
    conversationHistory[username].push({
      role: "assistant",
      content: response.choices[0].message.content,
    });

    res.json(response.choices[0].message.content);
  } catch (error: any) {
    console.error("Error starting conversation:", error);
    res.status(500).json({ error: error.message });
  }
});

// Continue a conversation
router.post("/step", async (req: Request, res: Response) => {
  const { username, message } = req.body;

  if (
    !username ||
    typeof username !== "string" ||
    !message ||
    typeof message !== "string"
  ) {
    return;
  }

  if (!conversationHistory[username]) {
    console.log("history not found for user:", username);
    return;
  }
  console.log("history", conversationHistory[username]);
  try {
    const response = await callOpenAI(
      [
        {
          role: "system",
          content: `You countinue be Sophon , with conversation history for user: ${username}`,
        },
        {
          role: "user",
          content: `conversationHistory: ${conversationHistory[username]} , input: ${message}`,
        },
      ],
      150
    );

    conversationHistory[username].push({
      role: "assistant",
      content: response.choices[0].message.content,
    });

    res.json(response.choices[0].message.content);
  } catch (error: any) {
    console.error("Error continuing conversation:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
