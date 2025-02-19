import cors from "cors";
import express from "express";
import requestIp from "request-ip";
import { createServer } from "http";
import session from "express-session";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { ApiError } from "./utils/ApiError";
import morganMiddleware from "./logger/morgan.logger";
import passport from "passport";

const app = express();
const httpServer = createServer(app);

// global middlewares
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN === "*"
        ? "*" // This might give CORS error for some origins due to credentials set to true
        : process.env.CORS_ORIGIN?.split(","),
    credentials: true,
  })
);

app.use(requestIp.mw());

// Rate limiter to avoid misuse of the service and avoid cost spikes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req, _res) => {
    return req.clientIp || req.ip || "unknown"; // Provide fallback values
  },
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${
        options.max
      } requests per ${options.windowMs / 60000} minutes`
    );
  },
});

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // configure static file to save images locally
app.use(cookieParser());

/// required for passport
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET!,
    resave: true,
    saveUninitialized: true,
  })
); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use(morganMiddleware);

// api routes
import { errorHandler } from "./middlewares/error.middlewares.js";

import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);

// common error handling middleware
app.use(errorHandler);

export { httpServer };
