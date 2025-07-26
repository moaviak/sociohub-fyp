import { body } from "express-validator";

export const createTeamValidator = () => {
  return [
    body("name")
      .notEmpty()
      .withMessage("Team name is required")
      .isLength({ max: 50 })
      .withMessage("Team name cannot exceed 50 characters"),
    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Team description cannot exceed 500 characters"),
    body("societyId").notEmpty().withMessage("Society ID is required"),
    body("leadId").optional().isUUID().withMessage("Invalid Lead ID"),
  ];
};

export const updateTeamValidator = () => {
  return [
    body("name")
      .optional()
      .notEmpty()
      .withMessage("Team name is required")
      .isLength({ max: 50 })
      .withMessage("Team name cannot exceed 50 characters"),
    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Team description cannot exceed 500 characters"),
    body("leadId").optional().isUUID().withMessage("Invalid Lead ID"),
    body("societyId").notEmpty().withMessage("Society ID is required"),
  ];
};

export const teamMembershipValidator = () => {
  return [
    body("teamId").notEmpty().withMessage("Team ID is required"),
    body("studentId").notEmpty().withMessage("Student ID is required"),
  ];
};

export const teamJoinRequestValidator = () => {
  return [
    body("teamId").notEmpty().withMessage("Team ID is required"),
    body("studentId").notEmpty().withMessage("Student ID is required"),
    body("message")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Message cannot exceed 500 characters"),
  ];
};

export const teamInvitationValidator = () => {
  return [
    body("teamId").notEmpty().withMessage("Team ID is required"),
    body("studentId").notEmpty().withMessage("Student ID is required"),
    body("invitedById").notEmpty().withMessage("Invited By ID is required"),
    body("message")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Message cannot exceed 500 characters"),
  ];
};

export const teamTaskValidator = () => {
  return [
    body("title").notEmpty().withMessage("Task title is required"),
    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters"),
    body("dueDate")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Invalid due date format"),
    body("societyId").notEmpty().withMessage("Society ID is required"),
  ];
};

export const updateTeamTaskStatusValidator = () => {
  return [
    body("status")
      .notEmpty()
      .withMessage("Status is required")
      .isIn(["TO_DO", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
      .withMessage("Invalid task status"),
  ];
};

export const teamAnnouncementValidator = () => {
  return [
    body("title").notEmpty().withMessage("Announcement title is required"),
    body("content").notEmpty().withMessage("Announcement content is required"),
    body("targetTeamIds")
      .optional()
      .isArray()
      .withMessage("Target Team IDs must be an array"),
  ];
};
