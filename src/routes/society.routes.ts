import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { upload } from "../middlewares/multer.middlewares";
import { createSocietyValidator } from "../validators/society.validators";
import { validate } from "../validators/validate";
import { createSociety, getSocieties } from "../controllers/society.controller";

const router = Router();

router
  .route("/")
  .post(
    verifyJWT,
    upload.single("logo"),
    createSocietyValidator(),
    validate,
    createSociety
  )
  .get(verifyJWT, getSocieties);

export default router;
