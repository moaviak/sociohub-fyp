import { body, param } from "express-validator";

export const createTaskValidator = () => [
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Task description is required"),
  body("assignedBySocietyId")
    .optional()
    .isString()
    .withMessage("Society ID must be a string"),
];

export const completeTaskValidator = () => [
  param("taskId").notEmpty().withMessage("Task ID is required"),
  body("isCompleted").isBoolean().withMessage("isCompleted must be a boolean"),
];

export const starTaskValidator = () => [
  param("taskId").notEmpty().withMessage("Task ID is required"),
  body("isStarred").isBoolean().withMessage("isStarred must be a boolean"),
];

export const assignTaskValidator = () => [
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Task description is required"),
  body("memberId").notEmpty().withMessage("Member ID is required"),
  body("societyId").notEmpty().withMessage("Society ID is required"),
];

export const deleteTaskValidator = () => [
  param("taskId").notEmpty().withMessage("Task ID is required"),
];

export const updateTaskDescriptionValidator = () => [
  param("taskId").notEmpty().withMessage("Task ID is required"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Task description is required"),
];
