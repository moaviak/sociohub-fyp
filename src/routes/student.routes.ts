import { Router } from "express";

import { validate } from "../validators/validate";
import {
  registerStudent,
  updateRegistrationNumber,
} from "../controllers/student.controller";
import {
  registrationNumberValidator,
  studentRegisterValidator,
} from "../validators/student.validators";
import { verifyJWT } from "../middlewares/auth.middlewares";

const router = Router();

router.route("/").post(studentRegisterValidator(), validate, registerStudent);

router
  .route("/reg-no")
  .post(
    verifyJWT,
    registrationNumberValidator(),
    validate,
    updateRegistrationNumber
  );

export default router;
