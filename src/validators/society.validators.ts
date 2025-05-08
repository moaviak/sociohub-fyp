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

export const removeMemberValidator = () => {
  return [
    body("reason").trim().notEmpty().withMessage("Removal reason is required."),
    body("studentId").trim().notEmpty().withMessage("Student ID is required."),
  ];
};

export const societySettingsValidator = () => {
  return [
    body("acceptingNewMembers")
      .notEmpty()
      .withMessage("Field is missing.")
      .isBoolean()
      .withMessage("Invalid settings."),
    body("membersLimit")
      .notEmpty()
      .withMessage("Field is missing.")
      .isNumeric()
      .withMessage("Invalid settings."),
  ];
};
