import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { corsOptions } from "./constant/common.constant.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";
import routes from "./routes/index.js";

// Create an instance of the Express application
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Application Middleware
app.use(cors(corsOptions)); // Enable Cross-Origin Resource Sharing
app.use(cookieParser());
app.use(express.json({ limit: "500mb" })); // Parse JSON request bodies
app.use(express.urlencoded({ limit: "500mb", extended: true })); // Parse URL-encoded request bodies
app.use(express.static(path.join(__dirname, "public")));

// Application Routes
app.use("/api/v1", routes);

app.get("/", async (req, res) => {
  res.send("Welcome to Church Logo production!!");
});
 
// Handle not found
app.use((req, res) => {
  // Return a JSON response with the appropriate status code and error message
  return res.status(400).json({
    success: false,
    message: "API not found",
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API not found",
      },
    ],
  });
});

// Global Error Handler
// Middleware to handle errors globally and send standardized error responses
app.use(globalErrorHandler);

// Export the app and the socket.io initialization function
export default app;
