import { Router } from "express";
import { userLoginValidator } from "../validators/auth.validators";
import { validate } from "../validators/validate";
import { loginUser, refreshAccessToken } from "../controllers/auth.controller";

const router = Router();

router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
