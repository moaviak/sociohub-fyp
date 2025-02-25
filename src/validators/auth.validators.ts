import { body } from "express-validator";

export const userLoginValidator = () => {
  return [
    body("email").optional().isEmail().withMessage("Email is invalid"),
    body("username").optional(),
    body("password").notEmpty().withMessage("Password is required"),
  ];
};

export const verifyEmailValidator = () => {
  return [
    body("email").notEmpty().withMessage("Email is required"),
    body("code").notEmpty().withMessage("Verification code is required"),
  ];
};
