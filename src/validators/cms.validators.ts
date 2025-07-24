import { body } from "express-validator";

export const createPostValidator = () => {
  return [
    body("content").optional().isString(),
    body("type")
      .optional()
      .isIn(["NORMAL", "EVENT_GALLERY"])
      .withMessage("Invalid post type"),
    body("societyId").isString().withMessage("Society ID is required"),
    body("eventId").optional().isString(),
    body("media").optional().isArray(),
    body("media.*.url").optional().isString(),
    body("media.*.type").optional().isString(),
  ];
};

export const updatePostValidator = () => {
  return [
    body("content").optional().isString(),
    body("media").optional().isArray(),
    body("media.*.url").optional().isString(),
    body("media.*.type").optional().isString(),
  ];
};

export const addCommentValidator = () => {
  return [
    body("content").isString().withMessage("Comment content is required"),
  ];
};

export const togglePostLikeValidator = () => {
  return [
    body("action")
      .isIn(["LIKE", "UNLIKE"])
      .withMessage("Invalid action type"),
  ];
};
