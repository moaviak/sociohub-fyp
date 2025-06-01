import { Router } from "express";
import * as taskController from "../controllers/tasks.controller";
import {
  createTaskValidator,
  completeTaskValidator,
  starTaskValidator,
  assignTaskValidator,
  deleteTaskValidator,
  updateTaskDescriptionValidator,
} from "../validators/task.validators";
import { validate } from "../validators/validate";
import { verifyJWT } from "../middlewares/auth.middlewares";

const router = Router();

// Fetch all tasks for the current user
router.get("/", verifyJWT, taskController.getUserTasks);
// Create a task
router.post(
  "/",
  verifyJWT,
  createTaskValidator(),
  validate,
  taskController.createTask
);
// Complete a task
router.patch(
  "/:taskId/complete",
  verifyJWT,
  completeTaskValidator(),
  validate,
  taskController.completeTask
);
// Star/unstar a task
router.patch(
  "/:taskId/star",
  verifyJWT,
  starTaskValidator(),
  validate,
  taskController.starTask
);
// Assign a task
router.post(
  "/assign",
  verifyJWT,
  assignTaskValidator(),
  validate,
  taskController.assignTask
);
// Delete a task
router.delete(
  "/:taskId",
  verifyJWT,
  deleteTaskValidator(),
  validate,
  taskController.deleteTask
);
// Update a task's description
router.patch(
  "/:taskId",
  verifyJWT,
  updateTaskDescriptionValidator(),
  validate,
  taskController.updateTaskDescription
);

export default router;
