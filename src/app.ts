import express from "express";
import dotenv from "dotenv";
import conversationRoutes from "./routes/conversation.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Construct __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "../public")));
// Middleware to parse JSON
app.use(express.json());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 30 requests per minute
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

// Register conversation routes
app.use("/api/conversation", conversationRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`SophonServerAPI running on http://localhost:${PORT}`);
});
