import express, { Request, Response, Router } from "express";
import fetch from "node-fetch"; // Ensure node-fetch is installed
import { AIChatGameConfig } from "../constants/conversation/aiChatGameConfig.js";

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

async function callOpenAI(
  messages: any[],
  max_tokens: number
): Promise<AgentResponse> {
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

  const data = (await response.json()) as AgentResponse;
  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to fetch from OpenAI.");
  }

  return data;
}

router.post("/agent", async (req: Request, res: Response) => {
  try {
    const { username, message } = req.body;

    if (!username || typeof username !== "string") {
      res.status(400).json({ error: "Invalid username. Must be a string." });
      return;
    }

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Invalid message. Must be a string." });
      return;
    }

    const prompt = `
      You are an AI agent Sophon assisting with game PlayerFunctions for Dark Forest MUD.

      The available PlayerFunctions are defined as ContractsFunctions:
      ${JSON.stringify(AIChatGameConfig)}
      Take args from user input and keep args position according functions requirment. if not specified silver put 0. if not specified artifactId use null, if not abbandon use false.
      Respond in the following JSON format:
      {
        "df_fcName": "FunctionName",
        "args": ["arg1", "arg2", "..."],
      }

      - If arguments are missing or unclear, ask the user to provide them.
      - Confirm the function name and describe its purpose briefly.
      - Limit to 6 arguments at most.
    `;

    const messages = [
      { role: "system", content: prompt },
      { role: "user", content: `Request: ${message}` },
    ];

    const aiResponse = await callOpenAI(messages, 200);

    const content = aiResponse.choices[0]?.message?.content;

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

export default router;
