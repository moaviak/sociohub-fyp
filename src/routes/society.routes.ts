import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { upload } from "../middlewares/multer.middlewares";
import { createSocietyValidator } from "../validators/society.validators";
import { validate } from "../validators/validate";
import { createSociety } from "../controllers/society.controller";

const router = Router();

router
  .route("/")
  .post(
    verifyJWT,
    upload.single("logo"),
    createSocietyValidator(),
    validate,
    createSociety
  );

export default router;
