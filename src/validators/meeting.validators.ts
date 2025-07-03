import { body } from "express-validator";

export const createMeetingValidator = [
  body("title").notEmpty().withMessage("Title is required"),
  body("scheduledAt")
    .isISO8601()
    .withMessage("Valid scheduled time is required"),
  body("societyId").notEmpty().withMessage("Host society is required"),
  body("audienceType").isIn(["ALL_SOCIETY_MEMBERS", "SPECIFIC_MEMBERS"]),
];
