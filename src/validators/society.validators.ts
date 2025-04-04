import { body } from "express-validator";

export const createSocietyValidator = () => {
  return [
    body("name").trim().notEmpty().withMessage("Society Name is required."),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Society statement of purpose is required."),
  ];
};

export const handleRequestValidator = () => {
  return [
    body("studentId").trim().notEmpty().withMessage("Student ID is required."),
    body("action")
      .trim()
      .isIn(["accept", "reject"])
      .withMessage("Action must be either 'accept' or 'reject'."),
  ];
};

export const removeMemberValidator = () => {
  return [
    body("studentId").trim().notEmpty().withMessage("Student ID is required."),
  ];
};
