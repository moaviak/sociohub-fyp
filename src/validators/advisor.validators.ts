import { body } from "express-validator";

export const advisorRegisterValidator = () => {
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
    body("displayName")
      .trim()
      .notEmpty()
      .withMessage("Display name is required"),
    body("phone")
      .trim()
      .optional({ values: "falsy" })
      .matches(/^057\d{7}$/)
      .withMessage("Phone number must follow the pattern 057xxxxxxx"),
  ];
};
