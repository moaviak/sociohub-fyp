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
    body("reason")
      .if(body("action").equals("reject"))
      .notEmpty()
      .withMessage("Reason is required when rejecting a request."),
  ];
};

export const removeMemberValidator = () => {
  return [
    body("studentId").trim().notEmpty().withMessage("Student ID is required."),
  ];
};

export const createRoleValidator = () => {
  return [
    body("name").trim().notEmpty().withMessage("Role name is required"),
    body("privileges")
      .notEmpty()
      .withMessage("Role privileges are required")
      .isArray()
      .withMessage("Invalid role privileges"),
  ];
};

export const updateRoleValidator = () => {
  return [
    body("roleId").trim().notEmpty().withMessage("Role id is required"),
    body("name").trim().notEmpty().withMessage("Role name is required"),
    body("privileges")
      .notEmpty()
      .withMessage("Role privileges are required")
      .isArray()
      .withMessage("Invalid role privileges"),
  ];
};

export const deleteRoleValidator = () => {
  return [body("roleId").trim().notEmpty().withMessage("Role id is required")];
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
