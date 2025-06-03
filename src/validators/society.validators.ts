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

export const updateSocietyProfileValidator = () => {
  return [
    body("description")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Vision cannot be empty if provided."),
    body("statementOfPurpose")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Statement of Purpose cannot be empty if provided."),
    body("advisorMessage")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Advisor Message cannot be empty if provided."),
    body("mission")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Mission cannot be empty if provided."),
    body("coreValues")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Core Values cannot be empty if provided."),
    // Logo is handled by multer, so no express-validator check here
  ];
};
