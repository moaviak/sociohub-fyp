import { body } from "express-validator";

export const createAnnouncementValidator = () => [
  body("societyId").notEmpty().withMessage("Society ID is required"),
  body("title").notEmpty().withMessage("Announcement title is required"),
  body("content")
    .notEmpty()
    .withMessage("Announcement content is required")
    .isString()
    .withMessage("Content must be a string"),
  body("publishDateTime")
    .optional()
    .isISO8601()
    .withMessage("Invalid publish date and time"),
  body("audience")
    .notEmpty()
    .withMessage("Announcement audience is required.")
    .isIn(["All", "Members"])
    .withMessage("Invalid audience type."),
  body("sendEmail")
    .optional()
    .isBoolean()
    .withMessage("Invalid sendEmail field."),
];

export const updateAnnouncementValidator = () => [
  body("title").optional().isString().withMessage("Title must be a string"),
  body("content").optional().isString().withMessage("Content must be a string"),
  body("publishDateTime")
    .optional()
    .isDate()
    .withMessage("Invalid publish date and time"),
  body("audience")
    .optional()
    .isIn(["All", "Members"])
    .withMessage("Invalid audience type."),
  body("sendEmail")
    .optional()
    .isBoolean()
    .withMessage("Invalid sendEmail field."),
  // Add other fields as needed
];
