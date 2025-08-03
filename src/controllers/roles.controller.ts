import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { IUser, UserType } from "../types";
import { ApiError } from "../utils/ApiError";
import prisma from "../db";
import { ApiResponse } from "../utils/ApiResponse";
import {
  sendRoleAssignmentEmails,
  sendRoleAssignmentNotifications,
} from "../services/role-email.service";
import {
  findMemberRole,
  getCurrentStudentRoles,
  getResponseMessage,
  processRoleChangeNotifications,
  updateStudentRoleAssignments,
  validateRolesInSociety,
  validateStudentSocietyMembership,
} from "../services/role-assignment.service";
import activityService from "../services/activity.service";

export const getSocietyRoles = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;

    if (!societyId) {
      throw new ApiError(400, "Society ID is required.");
    }

    // Fetch the roles, their privileges, and assigned members
    const roles = await prisma.role.findMany({
      where: { AND: [{ societyId }, { NOT: { name: "Member" } }] },
      select: {
        id: true,
        name: true,
        description: true,
        minSemester: true,
        createdAt: true,
        updatedAt: true,
        privileges: {
          select: {
            key: true,
          },
        },
        StudentSocietyRole: {
          select: {
            studentSociety: {
              select: {
                student: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    registrationNumber: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Format the response
    const formattedRoles = roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      minSemester: role.minSemester,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      privileges: role.privileges.map((p) => p.key),
      assignedMembers: role.StudentSocietyRole.map(
        (ssr) => ssr.studentSociety.student
      ),
    }));

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          formattedRoles,
          "Society roles successfully fetched."
        )
      );
  }
);

export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { societyId } = req.params;

  const { name, description, minSemester, privileges, members } = req.body;

  if (!societyId) {
    throw new ApiError(400, "Society ID is required.");
  }

  if (!name || !privileges || !Array.isArray(privileges)) {
    throw new ApiError(400, "Role name and privileges are required.");
  }

  // Validate privilege keys
  const dbPrivileges = await prisma.privilege.findMany({
    where: {
      key: {
        in: privileges,
      },
    },
  });

  if (dbPrivileges.length !== privileges.length) {
    throw new ApiError(400, "One or more privilege keys are invalid.");
  }

  // Check if a role with the same name already exists in the society
  const existingRole = await prisma.role.findFirst({
    where: {
      societyId,
      name: {
        equals: name,
        mode: "insensitive", // optional: for case-insensitive check
      },
    },
  });

  if (existingRole) {
    throw new ApiError(
      409,
      "A role with this name already exists in the society."
    );
  }

  // Start a transaction
  const role = await prisma.$transaction(async (tx) => {
    // Create the role
    const newRole = await tx.role.create({
      data: {
        name,
        description,
        minSemester,
        societyId,
        privileges: {
          connect: dbPrivileges.map((priv) => ({ id: priv.id })),
        },
      },
    });

    // If members are passed, assign the role to them
    if (Array.isArray(members) && members.length > 0) {
      const studentSocietyRoles = members.map((studentId: string) => ({
        studentId,
        societyId,
        roleId: newRole.id,
      }));

      // Validate studentSociety membership before assignment
      const validMemberships = await tx.studentSociety.findMany({
        where: {
          studentId: { in: members },
          societyId,
        },
        select: {
          studentId: true,
        },
      });

      const validMemberIds = validMemberships.map((s) => s.studentId);
      const validAssignments = studentSocietyRoles.filter((r) =>
        validMemberIds.includes(r.studentId)
      );

      await tx.studentSocietyRole.createMany({
        data: validAssignments,
        skipDuplicates: true,
      });
    }

    return newRole;
  });

  // Send notification emails in the background
  if (Array.isArray(members) && members.length > 0) {
    sendRoleAssignmentEmails({
      roleId: role.id,
      societyId,
      memberIds: members,
    }).catch((error) => {
      console.error("Background email processing failed:", error);
    });

    sendRoleAssignmentNotifications({
      roleId: role.id,
      societyId,
      memberIds: members,
    }).catch((error) => {
      console.error("Background notification processing failed: ", error);
    });
  }

  if (user.userType === UserType.STUDENT) {
    activityService.createActivityLog({
      studentId: user.id,
      societyId,
      action: "Create Role",
      description: `${user.firstName} ${user.lastName} created a new Role: ${role.name}`,
      nature: "CONSTRUCTIVE",
      targetId: role.id,
      targetType: "Role",
    });
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        role,
        "Role created successfully and members assigned."
      )
    );
});

export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  const { societyId } = req.params;
  const { roleId } = req.body;
  const user = req.user as IUser;

  if (!societyId || !roleId) {
    throw new ApiError(400, "Society ID and Role ID are required.");
  }

  // Verify role belongs to the society
  const role = await prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!role || role.societyId !== societyId) {
    throw new ApiError(
      400,
      "Invalid Role ID or does not belong to this society."
    );
  }

  await prisma.$transaction(async (tx) => {
    // Delete related student-role assignments
    await tx.studentSocietyRole.deleteMany({
      where: {
        roleId,
      },
    });

    // Disconnect privileges from role (optional but clean)
    await tx.role.update({
      where: { id: roleId },
      data: {
        privileges: {
          set: [], // remove all connections
        },
      },
    });

    // Delete the role
    await tx.role.delete({
      where: { id: roleId },
    });
  });

  if (user.userType === UserType.STUDENT) {
    activityService.createActivityLog({
      studentId: user.id,
      societyId,
      action: "Delete Role",
      description: `${user.firstName} ${user.lastName} deleted a Role: ${role.name}`,
      nature: "DESTRUCTIVE",
      targetId: role.id,
      targetType: "Role",
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Role deleted successfully."));
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { societyId } = req.params;
  const { roleId, name, description, minSemester, privileges, members } =
    req.body;

  if (!societyId || !roleId) {
    throw new ApiError(400, "Society ID and Role ID are required.");
  }

  const existingRole = await prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!existingRole || existingRole.societyId !== societyId) {
    throw new ApiError(
      404,
      "Role not found or doesn't belong to this society."
    );
  }

  // If name is being updated, check for duplicate
  if (name && name !== existingRole.name) {
    const duplicate = await prisma.role.findFirst({
      where: {
        societyId,
        name,
        NOT: { id: roleId },
      },
    });

    if (duplicate) {
      throw new ApiError(
        409,
        `Role with name '${name}' already exists in this society.`
      );
    }
  }

  const fetchedPrivileges = await prisma.privilege.findMany({
    where: {
      key: { in: privileges || [] },
    },
    select: { id: true },
  });

  const privilegeIds = fetchedPrivileges.map((p) => p.id);

  // Get current members before update to track changes
  const currentAssignments = await prisma.studentSocietyRole.findMany({
    where: { roleId },
    select: { studentId: true },
  });
  const currentMemberIds = currentAssignments.map((a) => a.studentId);

  // Transaction to update role, reset privileges and member assignments
  const updatedRole = await prisma.$transaction(async (tx) => {
    // Update the role
    const updated = await tx.role.update({
      where: { id: roleId },
      data: {
        name,
        description,
        minSemester: minSemester || null,
        privileges: {
          set: privilegeIds.map((id) => ({ id })),
        },
      },
    });

    // Remove old member assignments
    await tx.studentSocietyRole.deleteMany({ where: { roleId } });

    // Add new member assignments
    if (members && members.length > 0) {
      const newAssignments = members.map((studentId: string) => ({
        studentId,
        societyId,
        roleId,
      }));

      await tx.studentSocietyRole.createMany({
        data: newAssignments,
        skipDuplicates: true,
      });
    }

    return updated;
  });

  // Determine newly assigned members (those in members but not in currentMemberIds)
  const newlyAssignedMembers =
    members && members.length > 0
      ? members.filter((id: string) => !currentMemberIds.includes(id))
      : [];

  // Send notification emails to newly assigned members in the background
  if (newlyAssignedMembers.length > 0) {
    sendRoleAssignmentEmails({
      roleId,
      societyId,
      memberIds: newlyAssignedMembers,
    }).catch((error) => {
      console.error("Background email processing failed:", error);
    });

    sendRoleAssignmentNotifications({
      roleId,
      societyId,
      memberIds: newlyAssignedMembers,
    }).catch((error) => {
      console.error("Background notification processing failed: ", error);
    });
  }

  if (user.userType === UserType.STUDENT) {
    activityService.createActivityLog({
      studentId: user.id,
      societyId,
      action: "Update Role",
      description: `${user.firstName} ${user.lastName} updated a Role: ${updatedRole.name}`,
      nature: "NEUTRAL",
      targetId: updatedRole.id,
      targetType: "Role",
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedRole, "Role updated successfully."));
});

export const assignRolesToStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const startTime = Date.now(); // Track performance
    const { societyId } = req.params;
    const { studentId, roleIds } = req.body;

    if (!societyId) {
      throw new ApiError(400, "Society ID is required.");
    }

    // Check if student is a member of the society
    const isMember = await validateStudentSocietyMembership(
      studentId,
      societyId
    );
    if (!isMember) {
      throw new ApiError(404, "Student is not a member of this society.");
    }

    // Empty roleIds array is allowed - means remove all roles except the Member role
    const roleIdsToProcess = Array.isArray(roleIds) ? roleIds : [];

    // Special handling for empty roleIds array - this means remove all roles except Member
    const isRemoveAllRoles = Array.isArray(roleIds) && roleIds.length === 0;

    // Execute the following queries in parallel for better performance
    const [memberRole, currentRolesResult] = await Promise.all([
      // Find Member role to ensure it's preserved
      findMemberRole(societyId),

      // Get current roles of the student in the society
      getCurrentStudentRoles(studentId, societyId),
    ]);

    // Add Member role to the list if it exists but isn't included
    let updatedRoleIdsToProcess = [...roleIdsToProcess];
    if (memberRole && !updatedRoleIdsToProcess.includes(memberRole.id)) {
      updatedRoleIdsToProcess.push(memberRole.id);
    }

    // If we have roles to process (excluding the Member role), validate them
    const nonMemberRolesToProcess = memberRole
      ? updatedRoleIdsToProcess.filter((id) => id !== memberRole.id)
      : updatedRoleIdsToProcess;

    if (nonMemberRolesToProcess.length > 0) {
      const { valid } = await validateRolesInSociety(
        nonMemberRolesToProcess,
        societyId
      );
      if (!valid) {
        throw new ApiError(
          400,
          "One or more role IDs are invalid or do not belong to this society."
        );
      }
    }

    const currentRoleIds = currentRolesResult.map((r) => r.roleId);

    // Identify roles to add and remove
    const rolesToAdd = updatedRoleIdsToProcess.filter(
      (id: string) => !currentRoleIds.includes(id)
    );

    // Filter out Member role from removal
    const rolesToRemove = currentRoleIds.filter(
      (id: string) =>
        !updatedRoleIdsToProcess.includes(id) &&
        (!memberRole || id !== memberRole.id)
    );

    // Skip processing if no changes and not removing all roles
    if (
      rolesToAdd.length === 0 &&
      rolesToRemove.length === 0 &&
      !isRemoveAllRoles
    ) {
      const currentFormattedRoles = await prisma.studentSocietyRole.findMany({
        where: {
          studentId,
          societyId,
        },
        select: {
          role: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });

      return res.status(200).json(
        new ApiResponse(
          200,
          currentFormattedRoles.map((r) => r.role),
          "No changes to student roles."
        )
      );
    }

    // Execute the role updates - use a higher timeout value for the transaction if needed
    await updateStudentRoleAssignments(
      studentId,
      societyId,
      rolesToAdd,
      rolesToRemove
    );

    // Performance tracking
    const afterUpdateTime = Date.now();

    // Start notification process in the background without awaiting it
    // This ensures we don't block the response waiting for email/notification processing
    setImmediate(() => {
      processRoleChangeNotifications(
        studentId,
        societyId,
        rolesToAdd,
        rolesToRemove
      ).catch((error) => {
        console.error("Error processing role change notifications:", error);
      });
    });

    // Get updated roles for the response
    const updatedRoles = await prisma.studentSocietyRole.findMany({
      where: {
        studentId,
        societyId,
      },
      select: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    const formattedRoles = updatedRoles.map((r) => r.role);
    const responseMessage = getResponseMessage(rolesToAdd, rolesToRemove);

    return res
      .status(200)
      .json(new ApiResponse(200, formattedRoles, responseMessage));
  }
);
