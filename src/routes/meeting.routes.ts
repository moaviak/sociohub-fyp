import { Router } from "express";
import {
  createMeeting,
  getMeetingsForUser,
  joinMeeting,
  joinMeetingByCode,
  deleteMeeting,
} from "../controllers/meeting.controller";
// Import your authentication middleware
import { verifyJWT } from "../middlewares/auth.middlewares";

const router = Router();

// Create a meeting
router.post("/", verifyJWT, createMeeting);
// Get meetings for a user (optionally by society)
router.get("/", verifyJWT, getMeetingsForUser);
// Join a meeting by id
router.post("/:id/join", verifyJWT, joinMeeting);
// Join a meeting by code
router.post("/join-by-code", verifyJWT, joinMeetingByCode);
// Delete a meeting
router.delete("/:id", verifyJWT, deleteMeeting);

export default router;
