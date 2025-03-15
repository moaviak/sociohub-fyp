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
