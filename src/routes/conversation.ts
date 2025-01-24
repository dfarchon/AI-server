import express, { Request, Response, Router } from "express";
import fetch from "node-fetch";
import { AI_BOT_CHARACTER } from "../constants/conversation/aiBotCharacter.js";
import { Filter } from "bad-words";
// Define types for OpenAI API response
interface OpenAIResponse {
  choices: { message: { role: string; content: string } }[];
  error?: { message: string };
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API key in environment variables.");
}

const router: Router = express.Router();

// In-memory conversation history
const conversationHistory: Record<string, any[]> = {};

// Initialize the filter
const filter = new Filter({ placeHolder: "" });
// Function to sanitize input
const cleanMessage = (message: string): string => filter.clean(message);

// MAIN Helper function to call OpenAI API
// model LLM type
// respond as output
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
  //console.log("AI responded");
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
  // console.log("POST START:", username, " | msg:", message);
  try {
    if (
      !username ||
      typeof username !== "string" ||
      !message ||
      typeof message !== "string" // ||
      // !indexedHistory ||
      // typeof indexedHistory !== "string"
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
    // call AI with  initalPrompt and max respond tokens arguments
    const response = await callOpenAI(initialPrompt, 150);

    // Append AI response and user msg Hello! push to the history
    conversationHistory[username].push(
      {
        role: "assistant",
        content: response.choices[0].message.content,
      },
      {
        role: "user",
        content: `${cleanMessage(message)}`,
      }
    );
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

// Continue a conversation STEP
router.post("/step", async (req: Request, res: Response) => {
  const { username, message, indexedHistory } = req.body;
  // console.log("POST STEP:", username, " | msg:", message);
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
    console.log("history not found by Sophon-server for user:", username);
    // Init AI response and user msg Hello! push to the history if no history on server
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

      console.log("created initial history for assistant and user:", username);

      conversationHistory[username] = [...initHistory];
    } else {
      console.log("created indexed history for assistant and user:", username);
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

    conversationHistory[username].push(
      {
        role: "assistant",
        content: response.choices[0].message.content,
      },
      {
        role: "user",
        content: `${cleanMessage(message)}`,
      }
    );

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
    const { username } = req.params;

    if (!username || typeof username !== "string") {
      res.status(400).json({
        error: "Invalid input. Provide a valid username and message.",
      });
      return;
    }

    // Check if the userName exists in the conversation history
    if (!conversationHistory[username]) {
      res.status(400).json({
        error: "History not found for user:",
        username,
      });
      console.error("History not found for user:", username);
      return;
    }

    // Return the conversation for the given userName
    res.json({ conversation: conversationHistory[username] });
  } catch (error: any) {
    console.error("Error retrieving conversation:", error);
    res.status(500).json({ error: "Error retrieving conversation:" });
  }
});

export default router;
