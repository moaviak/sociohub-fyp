import { body } from "express-validator";

export const studentRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("password").trim().notEmpty().withMessage("Password is required"),
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("registrationNumber")
      .trim()
      .notEmpty()
      .withMessage("Registration number is required")
      .matches(/^(SP|FA)\d{2}-[A-Z]{3}-\d{1,3}$/)
      .withMessage("Registration number is invalid."),
  ];
};

export const registrationNumberValidator = () => {
  return [
    body("registrationNumber")
      .trim()
      .notEmpty()
      .withMessage("Registration number is required")
      .matches(/^(SP|FA)\d{2}-[A-Z]{3}-\d{1,3}$/)
      .withMessage("Registration number is invalid."),
  ];
};
