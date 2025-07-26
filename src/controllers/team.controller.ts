import { Request, Response } from "express";
import { TeamService } from "../services/team.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { IUser, UserType } from "../types";

const teamService = new TeamService();

export class TeamController {
  // Team Management (Society Admin)
  createTeam = asyncHandler(async (req: Request, res: Response) => {
    const logoFile = req.file as Express.Multer.File;
    const team = await teamService.createTeam(req.body, logoFile);
    res
      .status(201)
      .json(new ApiResponse(201, team, "Team created successfully"));
  });

  getTeams = asyncHandler(async (req: Request, res: Response) => {
    const { societyId } = req.params;
    const teams = await teamService.getTeams(societyId);
    res
      .status(200)
      .json(new ApiResponse(200, teams, "Teams fetched successfully"));
  });

  getTeamById = asyncHandler(async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const team = await teamService.getTeamById(teamId);
    if (team) {
      res
        .status(200)
        .json(new ApiResponse(200, team, "Team fetched successfully"));
    } else {
      throw new ApiError(404, "Team not found");
    }
  });

  updateTeam = asyncHandler(async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const team = await teamService.updateTeam(teamId, req.body);
    res
      .status(200)
      .json(new ApiResponse(200, team, "Team updated successfully"));
  });

  deleteTeam = asyncHandler(async (req: Request, res: Response) => {
    const { teamId } = req.params;
    await teamService.deleteTeam(teamId);
    res.status(200).json(new ApiResponse(200, {}, "Team deleted successfully"));
  });

  requestToJoinTeam = asyncHandler(async (req: Request, res: Response) => {
    const { teamId, studentId, message } = req.body;
    const request = await teamService.requestToJoinTeam(
      teamId,
      studentId,
      message
    );
    res
      .status(201)
      .json(new ApiResponse(201, request, "Join request sent successfully"));
  });

  approveJoinRequest = asyncHandler(async (req: Request, res: Response) => {
    const { requestId } = req.params;
    const { respondedById, responseNote } = req.body;
    const request = await teamService.approveJoinRequest(
      requestId,
      respondedById,
      responseNote
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, request, "Join request approved successfully")
      );
  });

  rejectJoinRequest = asyncHandler(async (req: Request, res: Response) => {
    const { requestId } = req.params;
    const { respondedById, responseNote } = req.body;
    const request = await teamService.rejectJoinRequest(
      requestId,
      respondedById,
      responseNote
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, request, "Join request rejected successfully")
      );
  });

  addMemberToTeam = asyncHandler(async (req: Request, res: Response) => {
    const { teamId, studentId } = req.body;
    const user = req.user as IUser;
    const member = await teamService.addMemberToTeam(
      teamId,
      studentId,
      user.id
    );
    res
      .status(201)
      .json(new ApiResponse(201, member, "Member added to team successfully"));
  });

  addTeamMembers = asyncHandler(async (req: Request, res: Response) => {
    const { teamId, studentIds } = req.body;
    const user = req.user as IUser;
    const members = await teamService.addTeamMembers(
      teamId,
      studentIds,
      user.id
    );
    res
      .status(201)
      .json(
        new ApiResponse(201, members, "Members added to team successfully")
      );
  });

  removeMemberFromTeam = asyncHandler(async (req: Request, res: Response) => {
    const { teamId, studentId } = req.body;
    const user = req.user as IUser;
    const member = await teamService.removeMemberFromTeam(
      teamId,
      studentId,
      user.id
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, member, "Member removed from team successfully")
      );
  });

  // Team-Level Task Management
  createTeamTask = asyncHandler(async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const { title, description, dueDate } = req.body;
    const user = req.user as IUser;

    const task = await teamService.createTeamTask({
      teamId,
      title,
      description,
      dueDate,
      userId: user.id,
    });
    res
      .status(201)
      .json(new ApiResponse(201, task, "Team task assigned successfully"));
  });

  assignTeamTask = asyncHandler(async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const { title, description, dueDate } = req.body;
    const user = req.user as IUser;

    const task = await teamService.assignTeamTask({
      teamId,
      title,
      description,
      dueDate,
      assignedByAdvisorId:
        user.userType === UserType.ADVISOR ? user.id : undefined,
      assignedById: user.userType === UserType.STUDENT ? user.id : undefined,
    });
    res
      .status(201)
      .json(new ApiResponse(201, task, "Team task assigned successfully"));
  });

  getTeamTasks = asyncHandler(async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const tasks = await teamService.getTeamTasks(teamId);
    res
      .status(200)
      .json(new ApiResponse(200, tasks, "Team tasks fetched successfully"));
  });

  updateTeamTaskStatus = asyncHandler(async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const { status } = req.body;
    const user = req.user as IUser;

    const task = await teamService.updateTeamTaskStatus(
      taskId,
      status,
      user.id
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, task, "Team task status updated successfully")
      );
  });

  // Get Team Join Requests
  getTeamJoinRequests = asyncHandler(async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const requests = await teamService.getTeamJoinRequests(teamId);
    res
      .status(200)
      .json(
        new ApiResponse(200, requests, "Join requests fetched successfully")
      );
  });

  leaveTeam = asyncHandler(async (req: Request, res: Response) => {
    const { teamId } = req.body;
    const user = req.user as IUser;
    await teamService.leaveTeam(teamId, user.id);
    res.status(200).json(new ApiResponse(200, {}, "Left team successfully"));
  });
}

export default new TeamController();
