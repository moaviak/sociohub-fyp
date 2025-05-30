import { Router } from "express";
import { getAllUsers } from "../controllers/user.controller";
import { verifyJWT } from "../middlewares/auth.middlewares";

const router = Router();

router.route("/").get(verifyJWT, getAllUsers);

export default router;
