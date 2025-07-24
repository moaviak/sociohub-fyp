import { NextFunction, Request, Response, Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { verifyContentPrivilege } from "../middlewares/privilege.middlewares";
import * as cmsController from "../controllers/cms.controller";
import { validate } from "../validators/validate";
import {
  createPostValidator,
  updatePostValidator,
  addCommentValidator,
  togglePostLikeValidator,
} from "../validators/cms.validators";
import { upload } from "../middlewares/multer.middlewares";

const router = Router();

router.use(verifyJWT);

router
  .route("/")
  .post(
    upload.array("media", 5),
    verifyContentPrivilege,
    createPostValidator(),
    validate,
    cmsController.createPost
  );

router.route("/society/:societyId").get(cmsController.getPostsBySociety);

router.route("/:postId").get(cmsController.getPostById);

router
  .route("/:postId/like")
  .post(togglePostLikeValidator(), validate, cmsController.togglePostLike);

router
  .route("/:postId/comments")
  .post(addCommentValidator(), validate, cmsController.addComment);

router.route("/comments/:commentId").delete(cmsController.deleteComment);

router
  .route("/:societyId/:postId")
  .put(
    upload.array("media", 5),
    (req: Request, _res: Response, next: NextFunction) => {
      req.body.societyId = req.params.societyId;
      next();
    },
    verifyContentPrivilege,
    updatePostValidator(),
    validate,
    cmsController.updatePost
  )
  .delete(
    (req: Request, _res: Response, next: NextFunction) => {
      req.body.societyId = req.params.societyId;
      next();
    },
    verifyContentPrivilege,
    cmsController.deletePost
  );

export default router;
