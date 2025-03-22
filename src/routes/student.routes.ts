import { Router } from "express";

import { validate } from "../validators/validate";
import { registerStudent } from "../controllers/student.controller";
import { studentRegisterValidator } from "../validators/student.validators";

const router = Router();

router.route("/").post(studentRegisterValidator(), validate, registerStudent);

export default router;
