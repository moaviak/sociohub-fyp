import { Router } from "express";

import { validate } from "../validators/validate";
import { advisorRegisterValidator } from "../validators/advisor.validators";
import {
  listSocietyAdvisors,
  registerAdvisor,
} from "../controllers/advisor.controller";
import { upload } from "../middlewares/multer.middlewares";

const router = Router();

router
  .route("/")
  .post(
    upload.single("avatar"),
    advisorRegisterValidator(),
    validate,
    registerAdvisor
  );
router.route("/list").get(listSocietyAdvisors);

export default router;
