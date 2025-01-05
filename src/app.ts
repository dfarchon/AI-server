import express from "express";
import dotenv from "dotenv";
import agentRoutes from "./routes/agent.js";
import conversationRoutes from "./routes/conversation.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { getMudConfig } from "./routes/mudConfigPull.js";
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Construct __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Configure Express to trust the proxy - trial to avoid server console error
app.set("trust proxy", 1); // This fixes the X-Forwarded-For issue
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "../public")));
// Middleware to parse JSON
app.use(express.json());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 6, // Limit each IP to 30 requests per minute
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter); // Apply to all routes
app.use(helmet()); // Secure app with Helmet
app.use(
  cors({
    origin: [process.env.ORIGIN_WEB_CLIENT || "http://localhost:3000"], // Replace with your frontend URL
    methods: ["GET", "POST"],
  })
);

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the Sophon AI ServerAPI!" });
});

// Dynamically pull and serve MUD configuration
app.get("/mud-config", (req, res) => {
  try {
    const mudConfig = getMudConfig();
    console.log("mud downloaded", mudConfig);
    res.json(mudConfig);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch MUD configuration" });
  }
});

// Register conversation routes
app.use("/api/conversation", conversationRoutes);
// Register conversation routes
app.use("/api/agent", agentRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`SophonServerAPI running on http://localhost:${PORT}`);
});
