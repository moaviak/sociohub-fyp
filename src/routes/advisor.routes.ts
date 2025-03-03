import { Router } from "express";
import { listSocietyAdvisors } from "../controllers/advisor.controller";

const router = Router();

router.route("/list").get(listSocietyAdvisors);

export default router;
