import express from "express";
import dotenv from "dotenv";
import conversationRoutes from "./routes/conversation.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
// Middleware to parse JSON
app.use(express.json());
// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 100 requests per minute
  message: "Too many requests from this IP, please try again later.",
});

// import winston from "winston";
// const logger = winston.createLogger({
//   level: "info",
//   transports: [
//     new winston.transports.Console(),
//     new winston.transports.File({ filename: "server.log" }),
//   ],
// });

// logger.info(`New request: ${req.method} ${req.url}`);

// // Register routes
app.use("/api/conversation", conversationRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`SophonServerAPI running on http://localhost:${PORT}`);
});

app.use(limiter); // Apply to all routes

app.use(helmet());

// app.use(
//   cors({
//     origin: ["https://your-frontend-domain.com"], // Allow only your frontend
//     methods: ["GET", "POST"],
//   })
// );
