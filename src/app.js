import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import httpStatus from "http-status";
import path from "path";
import Stripe from "stripe";
import { fileURLToPath } from "url";
import config from "./config/index.js";
import { corsOptions } from "./constant/common.constant.js";
import { clearTemporaryOrdersCron } from "./cron/clearTemporaryOrders.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";
import routes from "./routes/index.js";
import sendResponse from "./shared/sendResponse.js";

const app = express();

export const stripe = new Stripe(config.stripe_secret_key);
export const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors(corsOptions));
app.use(cookieParser());

app.use(
  express.json({
    limit: "100mb",
    verify: (req, res, buf) => {
      const url = req.originalUrl;
      if (url.includes("/payment/webhook")) {
        // Preserve the raw body for Stripe verification
        req.rawBody = buf;
      }
    },
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use("/public", express.static(path.join(__dirname, "public")));

clearTemporaryOrdersCron();

app.use("/api/v1", routes);

app.get("/", async (req, res) => {
  if (req.accepts("html")) {
    // Render view for browser requests
    return res.render("welcome", {
      title: "WELCOME TO CHURCH LOGO",
      currentYear: new Date().getFullYear(),
    });
  } else {
    // Return JSON for API requests
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "WELCOME TO CHURCH LOGO PRODUCTION!!",
      meta: null,
      data: null,
    });
  }
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
