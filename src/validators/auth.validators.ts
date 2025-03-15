import { body } from "express-validator";

export const userLoginValidator = () => {
  return [
    body("email").optional().isEmail().withMessage("Email is invalid"),
    body("registrationNumber")
      .optional()
      .matches(/^(SP|FA)\d{2}-[A-Z]{3}-\d{1,3}$/)
      .withMessage("Registration number is invalid."),
    body("password").notEmpty().withMessage("Password is required"),
  ];
};

export const verifyEmailValidator = () => {
  return [
    body("email").notEmpty().withMessage("Email is required"),
    body("code").notEmpty().withMessage("Verification code is required"),
  ];
};
