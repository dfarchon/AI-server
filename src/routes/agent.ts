import express, { Request, Response, Router } from "express";
import fetch from "node-fetch"; // Ensure node-fetch is installed
import { OpenAI } from "openai";
import { HttpsProxyAgent } from "https-proxy-agent";
import { Filter } from "bad-words";

import { predictTokenCost } from "./utils.js";

interface AgentResponse {
  aiResponse: {
    df_fcName: string;
    args: string[];
  };
  choices: { message: { role: string; content: string } }[];
  error?: { message: string };
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API key in environment variables.");
}

const router: Router = express.Router();
const temperature = 0.2;
const max_completion_tokens = 1000;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  httpAgent: new HttpsProxyAgent('http://127.0.0.1:7890'),
  timeout: 60000,
  maxRetries: 3,
});

// In-memory agent history
const agentHistory: Record<string, any[]> = {};

// Initialize the filter
const filter = new Filter({ placeHolder: "" });
const cleanMessage = (message: string): string => filter.clean(message);

// Main helper function to call OpenAI API
async function callOpenAI(messages: any[], max_tokens: number) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      max_tokens,
      temperature: 0.2,
    });

    return completion;
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}

// async function callAssitantAI(
//   messages: any[],
//   max_tokens: number
// ): Promise<AgentResponse> {
//   const response = await fetch("https://api.openai.com/v1/assistants", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${OPENAI_API_KEY}`,
//       "OpenAI-Beta": `assistants=v2`,
//     },
//     body: JSON.stringify({
//       model: "gpt-3.5-turbo",
//       messages,
//       max_tokens,
//       max_completion_tokens,
//       temperature,
//     }),
//   });

//   const data = (await response.json()) as AgentResponse;
//   if (!response.ok) {
//     throw new Error(data.error?.message || "Failed to fetch from OpenAI.");
//   }

//   return data;
// }

router.post("/agent", async (req: Request, res: Response) => {
  try {
    const { username, ownerAddress, message, selectedPlanets } = req.body;

    if (!username || typeof username !== "string") {
      res.status(400).json({ error: "Invalid username. Must be a string." });
      return;
    }

    if (!ownerAddress || typeof ownerAddress !== "string") {
      res
        .status(400)
        .json({ error: "Invalid ownerAddress. Must be a string." });
      return;
    }

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Invalid message. Must be a string." });
      return;
    }

    if (!selectedPlanets || typeof selectedPlanets !== "string") {
      res
        .status(400)
        .json({ error: "Invalid selectedPlanets. Must be a string." });
      return;
    }
    console.log("username:", username);
    console.log("selectedPlanets:", selectedPlanets);
    console.log("msg:", message);

    const messages = [
      {
        role: "system",
        content: `You are Sophon, an AI agent assisting in the Dark Forest game using PlayerFunctions for the Dark Forest MUD. Your goal is to analyze the player's selectedPlanets, generate commands, and maintain strict adherence to the game's mechanics, functions, and data formats.`
      },
      {
        role: "user",
        content: `Request: ${cleanMessage(message)}`
      }
    ];

    const completion = await callOpenAI(messages, 200);
    const content = completion.choices[0].message.content;

    if (!content) {
      res.status(500).json({ error: "AI response was empty or invalid." });
      return;
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      res.status(500).json({
        error: "Failed to parse AI response. Ensure AI returns valid JSON.",
      });
      return;
    }

    // Store in history if needed
    if (!agentHistory[username]) {
      agentHistory[username] = [];
    }

    agentHistory[username].push(
      {
        role: "assistant",
        content: content
      },
      {
        role: "user",
        content: cleanMessage(message)
      }
    );

    res.json({
      success: true,
      username,
      message,
      aiResponse: parsedContent,
    });

    console.log(username, message, parsedContent);
  } catch (error: any) {
    console.error("Error in /agent endpoint:", error.message);
    res.status(500).json({
      error: error.message || "An internal server Agent error occurred.",
    });
  }
});

// Add history retrieval endpoint if needed
router.get("/get_history/:userName", (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    if (!username || typeof username !== "string") {
      res.status(400).json({
        error: "Invalid input. Provide a valid username.",
      });
      return;
    }

    if (!agentHistory[username]) {
      res.status(400).json({
        error: "History not found for user",
        username,
      });
      return;
    }

    res.json({ history: agentHistory[username] });
  } catch (error: any) {
    console.error("Error retrieving agent history:", error);
    res.status(500).json({ error: "Error retrieving agent history" });
  }
});

export default router;
