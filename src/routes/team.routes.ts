import { NextFunction, Request, Response, Router } from "express";
import teamController from "../controllers/team.controller";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { upload } from "../middlewares/multer.middlewares";
import { validate } from "../validators/validate";
import {
  createTeamValidator,
  updateTeamValidator,
  teamMembershipValidator,
  teamJoinRequestValidator,
  teamInvitationValidator,
  teamTaskValidator,
  updateTeamTaskStatusValidator,
  teamAnnouncementValidator,
} from "../validators/team.validators";
import {
  verifyTasksPrivilege,
  verifyTeamsPrivilege,
} from "../middlewares/privilege.middlewares";

const router = Router();

// Team Management (Society Admin)
router.route("/societies/:societyId/teams").post(
  [
    verifyJWT,
    upload.single("logo"),
    (req: Request, res: Response, next: NextFunction) => {
      req.body.societyId = req.params.societyId;
      next();
    },
    verifyTeamsPrivilege,
    ...createTeamValidator(),
    validate,
  ],
  teamController.createTeam
);
router.route("/members").post(verifyJWT, teamController.addMemberToTeam);
router.route("/members").delete(verifyJWT, teamController.removeMemberFromTeam);
router.route("/leave").post(verifyJWT, teamController.leaveTeam);
router
  .route("/societies/:societyId/teams")
  .get(verifyJWT, teamController.getTeams);
router.route("/:teamId").get(verifyJWT, teamController.getTeamById);
router
  .route("/:teamId")
  .put(
    [
      verifyJWT,
      upload.single("logo"),
      verifyTeamsPrivilege,
      ...updateTeamValidator(),
      validate,
    ],
    teamController.updateTeam
  );
router.route("/societies/:societyId/teams/:teamId").delete(
  verifyJWT,
  [
    verifyJWT,
    (req: Request, res: Response, next: NextFunction) => {
      req.body.societyId = req.params.societyId;
      next();
    },
    verifyTeamsPrivilege,
  ],
  teamController.deleteTeam
);

// Team Membership Management
router.route("/join-request").post(verifyJWT, teamController.requestToJoinTeam);
router
  .route("/join-request/:requestId/approve")
  .put(verifyJWT, teamController.approveJoinRequest);
router
  .route("/join-request/:requestId/reject")
  .put(verifyJWT, teamController.rejectJoinRequest);
router.route("/members/batch").post(verifyJWT, teamController.addTeamMembers);

router
  .route("/:teamId/join-requests")
  .get(verifyJWT, teamController.getTeamJoinRequests);
// Team-Level Task Management
router
  .route("/tasks/:taskId/status")
  .put(
    verifyJWT,
    updateTeamTaskStatusValidator(),
    validate,
    teamController.updateTeamTaskStatus
  );
router
  .route("/:teamId/tasks")
  .post(
    verifyJWT,
    teamTaskValidator(),
    validate,
    teamController.createTeamTask
  );
router
  .route("/:teamId/tasks/assign")
  .post(
    verifyJWT,
    verifyTasksPrivilege,
    teamTaskValidator(),
    validate,
    teamController.assignTeamTask
  );
router.route("/:teamId/tasks").get(verifyJWT, teamController.getTeamTasks);

export default router;
