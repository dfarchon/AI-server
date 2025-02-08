import express, { Request, Response, Router } from "express";
import OpenAI from "openai";
import { Filter } from "bad-words";
import { AI_BOT_CHARACTER } from "../constants/conversation/aiBotCharacter.js";
import { HttpsProxyAgent } from "https-proxy-agent";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  httpAgent: new HttpsProxyAgent('http://127.0.0.1:7890'),
  timeout: 60000,
  maxRetries: 3,
});

const router: Router = express.Router();

// In-memory conversation history
const conversationHistory: Record<string, any[]> = {};

// Initialize the filter
const filter = new Filter({ placeHolder: "" });
// Function to sanitize input
const cleanMessage = (message: string): string => filter.clean(message);

// Main helper function to call OpenAI API
async function callOpenAI(messages: any[], max_tokens: number) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      max_tokens,
      temperature: 0.7,
    });

    return completion;
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}

// Start a conversation with character initialization and username
router.post("/start", async (req: Request, res: Response) => {
  const { username, message, indexedHistory } = req.body;

  // Temporary delete old history - api/conversation/start is used only once
  conversationHistory[username] = [];

  try {
    if (
      !username ||
      typeof username !== "string" ||
      !message ||
      typeof message !== "string"
    ) {
      res.status(400).json({
        error: "Invalid input. Provide a valid username and message.",
      });
      return;
    }

    console.log(
      "Post start: ",
      username,
      "orig:",
      message,
      "cleaned:",
      cleanMessage(message)
    );

    const initialPrompt = [
      {
        role: "system",
        content: `You are Sophon! , ${AI_BOT_CHARACTER.chatPrompt} , and you speak with user: ${username} , start conversation`,
      },
      {
        role: "user",
        content: `conversationHistory: ${indexedHistory}, input:${cleanMessage(
          message
        )}`,
      },
    ];

    const completion = await callOpenAI(initialPrompt, 150);
    const aiResponse = completion.choices[0].message.content;

    // Append AI response and user message to the history
    conversationHistory[username].push(
      {
        role: "assistant",
        content: aiResponse,
      },
      {
        role: "user",
        content: `${cleanMessage(message)}`,
      }
    );

    console.log("assistant start user:", username, "-", aiResponse);
    res.json(aiResponse);
  } catch (error: any) {
    console.error("Error starting conversation:", error);
    res.status(500).json({ error: error.message });
  }
});

// Continue conversation STEP
router.post("/step", async (req: Request, res: Response) => {
  const { username, message, indexedHistory } = req.body;

  if (
    !username ||
    typeof username !== "string" ||
    !message ||
    typeof message !== "string"
  ) {
    res.status(400).json({
      error: "Invalid input. Provide a valid username and message.",
    });
    return;
  }

  if (!conversationHistory[username]) {
    console.log("History not found by Sophon-server for user:", username);
    if (!indexedHistory) {
      const initHistory = [
        {
          role: "assistant",
          content: `Greetings!!! In the vast expanse of the Dark Forest!`,
        },
        {
          role: "user",
          content: `input: Hello!`,
        },
      ];
      conversationHistory[username] = [...initHistory];
    } else {
      conversationHistory[username] = [...indexedHistory];
    }
  }

  try {
    console.log(
      "POST Step: ",
      username,
      "orig:",
      message,
      "cleaned:",
      cleanMessage(message)
    );

    const completion = await callOpenAI(
      [
        {
          role: "system",
          content: `You continue be Sophon, ${AI_BOT_CHARACTER.chatPrompt}, with conversation history for user: ${username}`,
        },
        {
          role: "user",
          content: `conversationHistory: ${conversationHistory[username]}, input: ${cleanMessage(message)}`,
        },
      ],
      150
    );

    const aiResponse = completion.choices[0].message.content;

    conversationHistory[username].push(
      {
        role: "assistant",
        content: aiResponse,
      },
      {
        role: "user",
        content: `${cleanMessage(message)}`,
      }
    );

    console.log("assistant step user:", username, "-", aiResponse);
    res.json(aiResponse);
  } catch (error: any) {
    console.error("Error continuing conversation:", error);
    res.status(500).json({ error: error.message });
  }
});

// Route to get conversation by userName
router.get("/get_conversation/:userName", (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    if (!username || typeof username !== "string") {
      res.status(400).json({
        error: "Invalid input. Provide a valid username and message.",
      });
      return;
    }

    if (!conversationHistory[username]) {
      res.status(400).json({
        error: "History not found for user:",
        username,
      });
      console.error("History not found for user:", username);
      return;
    }

    res.json({ conversation: conversationHistory[username] });
  } catch (error: any) {
    console.error("Error retrieving conversation:", error);
    res.status(500).json({ error: "Error retrieving conversation:" });
  }
});

export default router;
