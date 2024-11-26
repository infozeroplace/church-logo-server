import { rateLimit } from "express-rate-limit";
import ApiError from "../error/ApiError.js";
import httpStatus from "http-status";

const limiter = (countdown, rate) => {
    const time = countdown * 60 * 1000;
  
    const limiterOb = rateLimit({
      windowMs: time, // Time window in milliseconds
      limit: rate, // Limit of requests per window
      standardHeaders: "draft-7", // Use modern `RateLimit` headers
      legacyHeaders: false, // Disable older `X-RateLimit-*` headers
      handler: (req, res, next) => {
        // When rate limit exceeded, throw a custom ApiError
        next(
          new ApiError(
            httpStatus.TOO_MANY_REQUESTS, // 429 status code
            "Too many requests. Please wait before trying again later.",
            {
              retryAfter: req.rateLimit.resetTime, // Optionally provide retry time
            }
          )
        );
      },
    });
  
    return limiterOb;
  };

export default limiter;
