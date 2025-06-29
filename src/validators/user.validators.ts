import { body } from "express-validator";

export const userProfileUpdateValidator = () => [
  body("firstName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("First name cannot be empty"),
  body("lastName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Last name cannot be empty"),
  body("phone")
    .optional()
    .trim()
    .matches(/^(?:\+92|0|92)?(3[0-9]{2})[0-9]{7}$/)
    .withMessage("Phone number must follow the pattern 03xxxxxxxxx"),
  body("bio").optional().trim(),
  body("displayName").optional().trim(), // Only for advisors, will check in controller
];
