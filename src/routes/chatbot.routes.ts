import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import {
  startChatSession,
  processQuery,
} from "../controllers/chatbot.controller";
import { validate } from "../validators/validate";
import { body } from "express-validator";

const router = Router();

router.use(verifyJWT);

// Start a new chat session
router.post("/session", startChatSession);

// Process a chat query
router.post(
  "/query",
  [
    body("sessionId").notEmpty().withMessage("Session ID is required"),
    body("query").notEmpty().withMessage("Query is required"),
    validate,
  ],
  processQuery
);

export default router;
