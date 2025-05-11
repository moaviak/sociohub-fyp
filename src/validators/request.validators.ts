import { body } from "express-validator";

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

export const deleteRequestValidator = () => {
  return [
    body("requestId").trim().notEmpty().withMessage("Request ID is required."),
  ];
};
