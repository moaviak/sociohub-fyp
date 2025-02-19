import { Router } from "express";
import { userLoginValidator } from "../validators/auth.validators";
import { validate } from "../validators/validate";
import { loginUser } from "../controllers/auth.controllers";

const router = Router();

router.route("/login").post(userLoginValidator(), validate, loginUser);

export default router;
