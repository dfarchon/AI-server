import express, { Request, Response } from "express";
import fetch from "node-fetch";
import { AI_BOT_CHARACTER } from "../constants/aiBotCharacter.js";
import { Filter } from "bad-words";
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

// Initialize the filter
const filter = new Filter({ placeHolder: "" });
// Function to sanitize input
const cleanMessage = (message: string): string => filter.clean(message);
console.log("OpeningAI call OPEN");
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
  console.log("Opened AI call OPEN");
  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to fetch from OpenAI.");
  }
  return data;
}

// Start a conversation init character and user name
router.post("/start", async (req: Request, res: Response) => {
  const { username, message, indexedHistory } = req.body;

  // temporary delete old history api/conversation/start is used only once
  conversationHistory[username] = [];
  console.log("POST START:", username, " | msg:", message);
  try {
    if (
      !username ||
      typeof username !== "string" ||
      !message ||
      typeof message !== "string" // ||
      // !indexedHistory ||
      // typeof indexedHistory !== "string"
    ) {
      return;
    }

    console.log(
      "start: ",
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
    const response = await callOpenAI(initialPrompt, 150);

    // Save conversation history
    conversationHistory[username] = initialPrompt;

    // Append AI response to the history
    conversationHistory[username].push({
      role: "assistant",
      content: response.choices[0].message.content,
    });
    console.log(
      "assistant start user:",
      username,
      "-",
      response.choices[0].message.content
    );
    res.json(response.choices[0].message.content);
  } catch (error: any) {
    console.error("Error starting conversation:", error);
    res.status(500).json({ error: error.message });
  }
});

// Continue a conversation
router.post("/step", async (req: Request, res: Response) => {
  const { username, message } = req.body;
  console.log("POST STEP:", username, " | msg:", message);
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

  console.log("step: ", username, message);

  try {
    console.log(
      "start: ",
      username,
      "orig:",
      message,
      "cleaned:",
      cleanMessage(message)
    );
    const response = await callOpenAI(
      [
        {
          role: "system",
          content: `You countinue be Sophon , ${AI_BOT_CHARACTER.chatPrompt} , with conversation history for user: ${username}`,
        },
        {
          role: "user",
          content: `conversationHistory: ${
            conversationHistory[username]
          } , input: ${cleanMessage(message)}`,
        },
      ],
      150
    );

    conversationHistory[username].push({
      role: "assistant",
      content: response.choices[0].message.content,
    });
    console.log(
      "assistant step user:",
      username,
      "-",
      response.choices[0].message.content
    );
    res.json(response.choices[0].message.content);
  } catch (error: any) {
    console.error("Error continuing conversation:", error);
    res.status(500).json({ error: error.message });
  }
});
// Route to get conversation by userName
router.get("/get_conversation/:userName", (req: Request, res: Response) => {
  try {
    const { userName } = req.params;

    // Check if the userName exists in the conversation history
    if (!conversationHistory[userName]) {
      console.error("History not found for user:", userName);
      return;
    }

    // Return the conversation for the given userName
    res.json({ conversation: conversationHistory[userName] });
  } catch (error: any) {
    console.error("Error retrieving conversation:", error);
    res.status(500).json({ error: "Error retrieving conversation:" });
  }
});

export default router;
