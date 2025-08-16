import { io } from "../app";
import prisma from "../db";
import { sendNotificationToUsers } from "../socket";
import { ApiError } from "../utils/ApiError";
import { haveTaskPrivilege } from "../utils/helpers";
import { createNotification } from "./notification.service";
import pushNotificationService from "./push-notification.service";

export const createTask = async ({
  description,
  createdByStudentId,
  createdByAdvisorId,
  assignedBySocietyId,
}: {
  description: string;
  createdByStudentId?: string;
  createdByAdvisorId?: string;
  assignedBySocietyId?: string;
}) => {
  if (!description) throw new ApiError(400, "Task description is required");
  const task = await prisma.task.create({
    data: {
      description,
      createdByStudentId,
      createdByAdvisorId,
      assignedBySocietyId,
    },
  });
  return task;
};

export const completeTask = async (
  taskId: string,
  userId: string,
  isCompleted: boolean
) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new ApiError(404, "Task not found");
  // Optionally: check if user is allowed to complete this task
  return prisma.task.update({
    where: { id: taskId },
    data: { isCompleted },
  });
};

export const starTask = async (
  taskId: string,
  userId: string,
  isStarred: boolean
) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new ApiError(404, "Task not found");
  // Optionally: check if user is allowed to star this task
  return prisma.task.update({
    where: { id: taskId },
    data: { isStarred },
  });
};

export const assignTask = async ({
  description,
  memberId,
  societyId,
  assignerId,
}: {
  description: string;
  memberId: string;
  societyId: string;
  assignerId: string;
}) => {
  // Check privilege
  const hasPrivilege = await haveTaskPrivilege(assignerId, societyId);
  if (!hasPrivilege)
    throw new ApiError(403, "You don't have permission to assign tasks");
  // Check if member is in society
  const isMember = await prisma.studentSociety.findFirst({
    where: { studentId: memberId, societyId },
  });
  if (!isMember) throw new ApiError(404, "Member is not part of the society");
  // Create and assign task
  const task = await prisma.task.create({
    data: {
      description,
      assignedBySocietyId: societyId,
      createdByStudentId: memberId,
    },
  });
  // Notify member
  (async () => {
    const notification = await createNotification({
      title: "New Task Assigned",
      description: task.description,
      recipients: [{ recipientType: "student", recipientId: memberId }],
      webRedirectUrl: "/todo",
    });

    if (notification) {
      sendNotificationToUsers(
        io,
        [{ recipientType: "student", recipientId: memberId }],
        notification
      );
      pushNotificationService.sendToRecipients(
        [{ recipientType: "student", recipientId: memberId }],
        {
          title: notification.title,
          body: notification.description,
        }
      );
    }
  })();
  return task;
};

export const deleteTask = async (taskId: string, userId: string) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new ApiError(404, "Task not found");
  // Prevent deletion if assigned by society
  if (task.assignedBySocietyId) {
    throw new ApiError(403, "Cannot delete a task assigned by a society");
  }
  // Optionally: check if user is allowed to delete this task
  await prisma.task.delete({ where: { id: taskId } });
  return { id: taskId };
};

export const getUserTasks = async (userId: string, limit?: number) => {
  // Fetch tasks created by or assigned to the user (student)
  return prisma.task.findMany({
    where: {
      OR: [
        { createdByStudentId: userId },
        { createdByAdvisorId: userId },
        // Optionally, you can add more logic if you want to fetch tasks assigned to a student
      ],
    },
    include: { assignedBySociety: true },
    orderBy: [
      { isStarred: "desc" },
      { isCompleted: "asc" },
      { createdAt: "desc" },
    ],
    ...(limit ? { take: limit } : {}),
  });
};

export const updateTaskDescription = async ({
  taskId,
  description,
  userId,
}: {
  taskId: string;
  description: string;
  userId: string;
}) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new ApiError(404, "Task not found");
  // Only creator (student/advisor) or society admin/advisor can update
  if (
    task.createdByStudentId !== userId &&
    task.createdByAdvisorId !== userId
  ) {
    throw new ApiError(403, "You do not have permission to update this task");
  }

  // TODO: Allow Privileged Users to Edit Society Tasks

  return prisma.task.update({
    where: { id: taskId },
    data: { description },
  });
};
