import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { IUser } from "../types";
import { ChatbotService } from "../services/chatbot/chatbot.service";

const chatbotService = new ChatbotService();

// Initialize chatbot documents on startup
// (async () => {
//   try {
//     await chatbotService.initializeDocuments();
//     console.log("Chatbot documents initialized successfully.");
//   } catch (err) {
//     console.error("Failed to initialize chatbot documents:", err);
//   }
// })();

export const startChatSession = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const sessionId = chatbotService.createSession(user.id, user.userType);

    return res
      .status(200)
      .json(
        new ApiResponse(200, { sessionId }, "Chat session started successfully")
      );
  }
);

export const processQuery = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId, query } = req.body;
    const user = req.user as IUser;

    const userContext = {
      id: user.id,
      type: user.userType,
      // Add any other context you want to pass to the chatbot
    };

    const result = await chatbotService.processQuery(
      sessionId,
      query,
      userContext
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          response: result.response,
          intermediateSteps: result.intermediateSteps,
        },
        "Query processed successfully"
      )
    );
  }
);
