import { body } from "express-validator";

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
