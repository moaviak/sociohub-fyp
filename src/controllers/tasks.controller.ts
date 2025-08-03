import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import * as taskService from "../services/tasks.service";
import { IUser } from "../types";

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { description, assignedBySocietyId } = req.body;
  const data = {
    description,
    assignedBySocietyId,
    createdByStudentId: user.userType === "student" ? user.id : undefined,
    createdByAdvisorId: user.userType === "advisor" ? user.id : undefined,
  };
  const task = await taskService.createTask(data);
  res.status(201).json(new ApiResponse(201, task, "Task created successfully"));
});

export const completeTask = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const { taskId } = req.params;
    const { isCompleted } = req.body;
    if (typeof isCompleted !== "boolean") {
      throw new ApiError(400, "isCompleted must be a boolean");
    }
    const task = await taskService.completeTask(taskId, user.id, isCompleted);
    res
      .status(200)
      .json(new ApiResponse(200, task, "Task completion status updated"));
  }
);

export const starTask = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { taskId } = req.params;
  const { isStarred } = req.body;
  if (typeof isStarred !== "boolean") {
    throw new ApiError(400, "isStarred must be a boolean");
  }
  const task = await taskService.starTask(taskId, user.id, isStarred);
  res
    .status(200)
    .json(new ApiResponse(200, task, "Task starred status updated"));
});

export const assignTask = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { description, memberId, societyId } = req.body;
  const task = await taskService.assignTask({
    description,
    memberId,
    societyId,
    assignerId: user.id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task assigned successfully"));
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { taskId } = req.params;
  await taskService.deleteTask(taskId, user.id);
  res.status(200).json(new ApiResponse(200, null, "Task deleted successfully"));
});

export const getUserTasks = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined;
    const tasks = await taskService.getUserTasks(user.id, limit);
    res
      .status(200)
      .json(new ApiResponse(200, tasks, "User tasks fetched successfully"));
  }
);

export const updateTaskDescription = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const { taskId } = req.params;
    const { description } = req.body;
    const task = await taskService.updateTaskDescription({
      taskId,
      description,
      userId: user.id,
    });
    res
      .status(200)
      .json(
        new ApiResponse(200, task, "Task description updated successfully")
      );
  }
);
