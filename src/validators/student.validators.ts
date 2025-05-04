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
      .matches(/^(SP|FA)\d{2}-[A-Z]{3}-\d{3}$/)
      .withMessage("Registration number is invalid."),
  ];
};

export const societyJoinRequestValidator = () => {
  return [
    body("societyId").trim().notEmpty().withMessage("Society Id is required"),
    body("whatsappNo")
      .trim()
      .notEmpty()
      .withMessage("WhatsApp number is required"),
    body("semester").isNumeric().notEmpty().withMessage("Semester is required"),
    body("reason")
      .trim()
      .notEmpty()
      .withMessage("Reason for joining is required"),
    body("expectations")
      .trim()
      .notEmpty()
      .withMessage("Expectations from the society is required"),
  ];
};
