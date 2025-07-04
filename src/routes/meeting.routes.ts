import { Router } from "express";
import {
  createMeeting,
  getMeetingsForUser,
  joinMeeting,
  joinMeetingByCode,
  deleteMeeting,
  getMeetingById,
  cancelMeeting,
  endMeeting,
} from "../controllers/meeting.controller";
// Import your authentication middleware
import { verifyJWT } from "../middlewares/auth.middlewares";
import { createMeetingValidator } from "../validators/meeting.validators";
import { validate } from "../validators/validate";
import { verifyMeetingsPrivilege } from "../middlewares/privilege.middlewares";
import { body } from "express-validator";

const router = Router();

// Create a meeting
router.post(
  "/",
  [verifyJWT, ...createMeetingValidator, validate, verifyMeetingsPrivilege],
  createMeeting
);

// Get meetings for a user (optionally by society)
router.get("/my-meetings", verifyJWT, getMeetingsForUser);

// Join a meeting by id
router.post("/:id/join", verifyJWT, joinMeeting);

// Cancel a meeting
router.post("/:id/cancel", verifyJWT, cancelMeeting);

// End a meeting
router.post("/:id/end", verifyJWT, endMeeting);

// Join a meeting by code
router.post(
  "/join-by-code",
  [
    verifyJWT,
    body("meetingCode").notEmpty().withMessage("Meeting code is required"),
    validate,
  ],
  joinMeetingByCode
);

// Get a meeting by id
router.get("/:id", verifyJWT, getMeetingById);

// Delete a meeting
router.delete("/:id", verifyJWT, deleteMeeting);

export default router;
