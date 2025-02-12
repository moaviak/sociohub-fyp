import cors from "cors";
import express from "express";
import requestIp from "request-ip";
import { createServer } from "http";
import cookieParser from "cookie-parser";

import morganMiddleware from "./logger/morgan.logger";

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

// TODO: Add Rate Limiter
// Rate limiter to avoid misuse of the service and avoid cost spikes

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // configure static file to save images locally
app.use(cookieParser());

// TODO: Configure Passport.js

app.use(morganMiddleware);

// TODO: Implement error handling middleware

export { httpServer };
