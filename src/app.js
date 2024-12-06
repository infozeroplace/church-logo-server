import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import path from "path";
import Stripe from "stripe";
import { fileURLToPath } from "url";
import config from "./config/index.js";
import { corsOptions } from "./constant/common.constant.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";
import routes from "./routes/index.js";
import bodyParser from 'body-parser';
import { clearTemporaryOrdersCron } from "./cron/clearTemporaryOrders.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const stripe = new Stripe(config.stripe_secret_key);

app.use(cors(corsOptions));
app.use(cookieParser());

app.use(
  express.json({
    limit: "500mb",
    verify: (req, res, buf) => {
      const url = req.originalUrl;
      if (url.includes("/payment/webhook")) {
        // Preserve the raw body for Stripe verification
        req.rawBody = buf;
      }
    },
  })
);

app.use(express.urlencoded({ limit: "500mb", extended: true }));
app.use(express.static(path.join(__dirname, "public")));

clearTemporaryOrdersCron();

app.use("/api/v1", routes);

app.get("/", async (req, res) => {
  res.send("Welcome to Church Logo production!!");
});

app.use((req, res) => {
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

app.use(globalErrorHandler);

export default app;
