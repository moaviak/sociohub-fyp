import prisma from "../db";
import { ApiError } from "../utils/ApiError";
import {
  sendRoleAssignmentEmails,
  sendRoleAssignmentNotifications,
} from "./role-email.service";

/**
 * Validates that a student is a member of a society
 */
export const validateStudentSocietyMembership = async (
  studentId: string,
  societyId: string
): Promise<boolean> => {
  const studentSociety = await prisma.studentSociety.findUnique({
    where: {
      studentId_societyId: {
        studentId,
        societyId,
      },
    },
  });

  return !!studentSociety;
};

/**
 * Validates that all provided role IDs belong to the specified society
 */
export const validateRolesInSociety = async (
  roleIds: string[],
  societyId: string
): Promise<{ valid: boolean; roles: any[] }> => {
  if (roleIds.length === 0) {
    return { valid: true, roles: [] };
  }

  const roles = await prisma.role.findMany({
    where: {
      id: { in: roleIds },
      societyId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  return {
    valid: roles.length === roleIds.length,
    roles,
  };
};

/**
 * Gets current roles assigned to a student in a society
 */
export const getCurrentStudentRoles = async (
  studentId: string,
  societyId: string
) => {
  const currentRoles = await prisma.studentSocietyRole.findMany({
    where: {
      studentId,
      societyId,
    },
    select: {
      roleId: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return currentRoles;
};

/**
 * Find the Member role for a society
 */
export const findMemberRole = async (societyId: string) => {
  const memberRole = await prisma.role.findFirst({
    where: {
      societyId,
      name: "Member",
    },
    select: {
      id: true,
      name: true,
    },
  });

  return memberRole;
};

/**
 * Updates student role assignments in a society
 * Ensures the Member role is never removed
 * Uses separate transactions for better performance
 */
export const updateStudentRoleAssignments = async (
  studentId: string,
  societyId: string,
  rolesToAdd: string[],
  rolesToRemove: string[]
) => {
  // Find the Member role for this society
  const memberRole = await findMemberRole(societyId);

  // Filter out the Member role from rolesToRemove if it exists
  let filteredRolesToRemove = rolesToRemove;
  if (memberRole) {
    filteredRolesToRemove = rolesToRemove.filter(
      (roleId) => roleId !== memberRole.id
    );
  }

  // Use separate operations instead of a single large transaction
  // First, remove roles that are no longer assigned (except Member role)
  if (filteredRolesToRemove.length > 0) {
    await prisma.studentSocietyRole.deleteMany({
      where: {
        studentId,
        societyId,
        roleId: { in: filteredRolesToRemove },
      },
    });
  }

  // Then add new roles
  if (rolesToAdd.length > 0) {
    // Process in smaller batches if there are many roles to add
    const batchSize = 25;
    for (let i = 0; i < rolesToAdd.length; i += batchSize) {
      const batch = rolesToAdd.slice(i, i + batchSize);
      const newRoles = batch.map((roleId: string) => ({
        studentId,
        societyId,
        roleId,
      }));

      await prisma.studentSocietyRole.createMany({
        data: newRoles,
        skipDuplicates: true,
      });
    }
  }
};

/**
 * Generates appropriate notification title and description based on role changes
 */
export const generateRoleChangeNotificationContent = (
  societyName: string,
  addedRoleNames: string[],
  removedRoleNames: string[],
  currentRolesCount: number = 0
) => {
  let notificationTitle = "";
  let notificationDescription = "";

  if (addedRoleNames.length > 0 && removedRoleNames.length > 0) {
    notificationTitle = `Role Changes in ${societyName}`;

    const addedRolesText =
      addedRoleNames.length === 1
        ? `"${addedRoleNames[0]}"`
        : `${addedRoleNames
            .slice(0, -1)
            .map((name) => `"${name}"`)
            .join(", ")} and "${addedRoleNames[addedRoleNames.length - 1]}"`;

    const removedRolesText =
      removedRoleNames.length === 1
        ? `"${removedRoleNames[0]}"`
        : `${removedRoleNames
            .slice(0, -1)
            .map((name) => `"${name}"`)
            .join(", ")} and "${
            removedRoleNames[removedRoleNames.length - 1]
          }"`;

    notificationDescription = `Your roles in "${societyName}" have been updated. You've been assigned ${addedRolesText} ${
      addedRoleNames.length === 1 ? "role" : "roles"
    } and removed from ${removedRolesText} ${
      removedRoleNames.length === 1 ? "role" : "roles"
    }.`;
  } else if (addedRoleNames.length > 0) {
    notificationTitle = `New Role${
      addedRoleNames.length > 1 ? "s" : ""
    } Assigned in ${societyName}`;

    const rolesText =
      addedRoleNames.length === 1
        ? `"${addedRoleNames[0]}"`
        : `${addedRoleNames
            .slice(0, -1)
            .map((name) => `"${name}"`)
            .join(", ")} and "${addedRoleNames[addedRoleNames.length - 1]}"`;

    notificationDescription = `You have been assigned the ${
      addedRoleNames.length > 1 ? "roles" : "role"
    } of ${rolesText} in "${societyName}". You can now access the features and responsibilities linked to ${
      addedRoleNames.length > 1 ? "these roles" : "this role"
    }.`;
  } else if (removedRoleNames.length > 0) {
    if (removedRoleNames.length === 1) {
      notificationTitle = `Role Removed in ${societyName}`;
      notificationDescription = `You have been removed from the role of "${removedRoleNames[0]}" in "${societyName}".`;
    } else {
      notificationTitle = `Roles Removed in ${societyName}`;

      // Check if all non-Member roles have been removed (current non-Member roles count is 0)
      if (currentRolesCount === 0) {
        notificationDescription = `All your additional roles in "${societyName}" have been removed. You remain a member of the society with the basic Member role.`;
      } else {
        const rolesText = `${removedRoleNames
          .slice(0, -1)
          .map((name) => `"${name}"`)
          .join(", ")} and "${removedRoleNames[removedRoleNames.length - 1]}"`;
        notificationDescription = `You have been removed from the roles of ${rolesText} in "${societyName}".`;
      }
    }
  } else {
    // No changes in roles
    return null;
  }

  return { notificationTitle, notificationDescription };
};

/**
 * Processes role change notifications as a background task
 */
export const processRoleChangeNotifications = async (
  studentId: string,
  societyId: string,
  addedRoleIds: string[],
  removedRoleIds: string[]
) => {
  try {
    // Early return if no changes
    if (addedRoleIds.length === 0 && removedRoleIds.length === 0) {
      return;
    }

    // Find the Member role
    const memberRole = await findMemberRole(societyId);

    // Filter out Member role from the added roles for notification purposes
    // We don't want to notify users about the Member role being preserved/added
    const filteredAddedRoleIds = memberRole
      ? addedRoleIds.filter((id) => id !== memberRole.id)
      : addedRoleIds;

    // If after filtering, there are no real changes, return early
    if (filteredAddedRoleIds.length === 0 && removedRoleIds.length === 0) {
      return;
    }

    // Fetch all necessary data in parallel for better performance
    const [student, society, currentRolesCount] = await Promise.all([
      // Get student details
      prisma.student.findUnique({
        where: { id: studentId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      }),

      // Get society details
      prisma.society.findUnique({
        where: { id: societyId },
        select: {
          id: true,
          name: true,
          logo: true,
        },
      }),

      // Get current roles count for "all roles removed" check
      // We should only count non-Member roles
      prisma.studentSocietyRole.count({
        where: {
          studentId,
          societyId,
          role: {
            name: { not: "Member" },
          },
        },
      }),
    ]);

    // Early return if required data is missing
    if (!student || !society) {
      console.error(
        `Missing required data for notification. Student or society not found.`
      );
      return;
    }

    // Fetch role names in parallel
    const [addedRoles, removedRoles] = await Promise.all([
      // Get names of added roles (excluding Member role)
      filteredAddedRoleIds.length > 0
        ? prisma.role.findMany({
            where: { id: { in: filteredAddedRoleIds } },
            select: { id: true, name: true },
          })
        : Promise.resolve([]),

      // Get names of removed roles
      removedRoleIds.length > 0
        ? prisma.role.findMany({
            where: { id: { in: removedRoleIds } },
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
    ]);

    const addedRoleNames = addedRoles.map((r) => r.name);
    const removedRoleNames = removedRoles.map((r) => r.name);

    // Generate notification content
    const notificationContent = generateRoleChangeNotificationContent(
      society.name,
      addedRoleNames,
      removedRoleNames,
      currentRolesCount
    );

    if (!notificationContent) return;

    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        title: notificationContent.notificationTitle,
        description: notificationContent.notificationDescription,
        image: society.logo,
        recipients: {
          create: [
            {
              recipientType: "student",
              student: { connect: { id: student.id } },
              webRedirectUrl: `/society/${society.id}`,
              mobileRedirectUrl: `/(student-tabs)/society/${society.id}`,
              isRead: false,
              isDeleted: false,
            },
          ],
        },
      },
    });

    // Send real-time notification asynchronously
    try {
      const { sendNotificationToUsers } = require("../socket");
      const { io } = require("../app");

      const recipients = [
        {
          recipientId: student.id,
          recipientType: "student" as const,
          webRedirectUrl: `/society/${society.id}`,
          mobileRedirectUrl: `/(student-tabs)/society/${society.id}`,
        },
      ];

      // No await here - fire and forget to not block
      sendNotificationToUsers(io, recipients, {
        id: notification.id,
        title: notificationContent.notificationTitle,
        description: notificationContent.notificationDescription,
        image: society.logo,
        createdAt: notification.createdAt,
      });
    } catch (error) {
      console.error("Failed to send real-time notification:", error);
    }

    // For role additions, also send emails (exclude Member role) asynchronously
    if (filteredAddedRoleIds.length > 0) {
      try {
        // No await here - fire and forget to not block
        sendRoleAssignmentEmails({
          roleId: filteredAddedRoleIds[0], // Using the first role for simplicity
          societyId,
          memberIds: [studentId],
        }).catch((error) =>
          console.error("Failed to send role assignment emails:", error)
        );
      } catch (error) {
        console.error("Failed to initiate role assignment emails:", error);
      }
    }
  } catch (error) {
    console.error("Error processing role change notifications:", error);
  }
};

/**
 * Gets a formatted response message based on role changes
 */
export const getResponseMessage = (
  rolesToAdd: string[],
  rolesToRemove: string[]
) => {
  let responseMessage = "Student roles updated successfully.";

  if (rolesToAdd.length > 0 && rolesToRemove.length > 0) {
    responseMessage = `Roles updated: ${rolesToAdd.length} added, ${rolesToRemove.length} removed. Default Member role preserved.`;
  } else if (rolesToAdd.length > 0) {
    responseMessage = `${rolesToAdd.length} new role${
      rolesToAdd.length > 1 ? "s" : ""
    } assigned successfully.`;
  } else if (rolesToRemove.length > 0) {
    if (rolesToRemove.length === 1) {
      responseMessage =
        "1 role removed successfully. Default Member role preserved.";
    } else {
      // Check if all roles have been removed
      responseMessage = `${rolesToRemove.length} roles removed successfully. Default Member role preserved.`;
    }
  } else {
    responseMessage = "No changes made to student roles.";
  }

  return responseMessage;
};
