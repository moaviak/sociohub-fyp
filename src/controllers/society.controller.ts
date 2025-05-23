import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { IUser, RequestAction } from "../types";
import prisma from "../db";
import { ApiError } from "../utils/ApiError";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { getLocalPath, haveMembersPrivilege } from "../utils/helpers";
import { ApiResponse } from "../utils/ApiResponse";
import {
  sendMemberRemovalStatusEmail,
  sendMemberRemovalStatusNotification,
} from "../services/society-email.service";

export const createSociety = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const { id, email } = req.user as IUser;

    // Verify that advisor exist in advisors list
    const verify = await prisma.societyAdvisor.findUnique({ where: { email } });

    if (!verify) {
      throw new ApiError(403, "Unauthorized: You cannot create a society.");
    }

    const advisor = await prisma.advisor.findUnique({ where: { id } });

    if (!advisor) {
      throw new ApiError(401, "Unauthorized: Advisor doesn't exist.");
    }

    if (advisor.societyId) {
      throw new ApiError(403, "An advisor can only create one society.");
    }

    const logo = req.file?.filename && getLocalPath(req.file?.filename);

    const uploadResult = await uploadOnCloudinary(logo || "", name);
    const society = await prisma.society.create({
      data: {
        name,
        description,
        logo: uploadResult?.secure_url || "",
        advisor: {
          connect: {
            id: advisor.id,
          },
        },
      },
    });

    await prisma.role.create({
      data: {
        name: "Member",
        societyId: society.id,
        description:
          "A member of the society who participates in activities and events.",
      },
    });
    res
      .status(201)
      .json(new ApiResponse(201, { society }, "Society successfully created."));
  }
);

export const getSocieties = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;

    const societies = await prisma.society.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        logo: true,
        acceptingNewMembers: true,
        createdAt: true,
        updatedAt: true,
        advisor: {
          select: {
            id: true,
            displayName: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
          },
        },
        roles: {
          select: {
            id: true,
            name: true,
            minSemester: true,
          },
        },
        _count: {
          select: {
            members: true,
            joinRequests: true,
          },
        },
        members: {
          where: { studentId: user.id },
          select: { studentId: true },
        },
        joinRequests: {
          where: { studentId: user.id, status: "PENDING" },
          select: { studentId: true },
        },
      },
    });

    const societiesWithStatus = societies.map((society) => ({
      ...society,
      isMember: society.members.length > 0,
      hasRequestedToJoin: society.joinRequests.length > 0,
      members: undefined,
      joinRequests: undefined,
    }));

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          societiesWithStatus,
          "Societies successfully fetched."
        )
      );
  }
);

export const getSociety = asyncHandler(async (req: Request, res: Response) => {
  const { societyId } = req.params;

  if (!societyId) {
    throw new ApiError(400, "Society id is required.");
  }

  const society = await prisma.society.findUnique({
    where: { id: societyId },
    select: {
      id: true,
      name: true,
      description: true,
      logo: true,
      membersLimit: true,
      acceptingNewMembers: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!society) {
    throw new ApiError(400, "Invalid society id.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, society, "Society successfully fetched."));
});

export const getSocietyMembers = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;
    const user = req.user as IUser;

    if (!societyId) {
      throw new ApiError(400, "Society ID is required.");
    }

    // 1. Check if the user is the advisor or a member of the society
    const [isAdvisor, isMember] = await prisma.$transaction([
      prisma.advisor.findFirst({
        where: {
          id: user.id,
          societyId: societyId,
        },
        select: { id: true },
      }),
      prisma.studentSociety.findFirst({
        where: {
          studentId: user.id,
          societyId: societyId,
        },
        select: { studentId: true },
      }),
    ]);

    if (!isAdvisor && !isMember) {
      throw new ApiError(
        403,
        "You are not authorized to view members of this society."
      );
    }

    // 2. Fetch members with their roles and privileges
    const members = await prisma.studentSociety.findMany({
      where: { societyId },
      select: {
        societyId: true,
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
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                privileges: {
                  select: {
                    key: true,
                  },
                },
              },
            },
          },
        },
        interestedRole: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 3. Format the response
    const formattedMembers = members.map((member) => {
      const allRoles = member.roles.map((r) => r.role);

      // Filter roles: if there are other roles than "Member", exclude "Member"
      const filteredRoles =
        allRoles.length > 1
          ? allRoles.filter((role) => role.name !== "Member")
          : allRoles;

      return {
        id: member.student.id,
        societyId: member.societyId,
        firstName: member.student.firstName,
        lastName: member.student.lastName,
        email: member.student.email,
        registrationNumber: member.student.registrationNumber,
        interestedRole: member.interestedRole,
        roles: filteredRoles.map((role) => ({
          id: role.id,
          name: role.name,
        })),
        avatar: member.student.avatar,
      };
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          formattedMembers,
          "Society members fetched successfully."
        )
      );
  }
);

export const removeMember = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;
    const { studentId, reason } = req.body;
    const user = req.user as IUser;

    if (!societyId || !studentId) {
      throw new ApiError(400, "Society ID and Student ID are required.");
    }

    if (studentId === user.id) {
      throw new ApiError(400, "You can't remove yourself.");
    }

    // Check if the student is actually a member of the society
    const studentMembership = await prisma.studentSociety.findUnique({
      where: {
        studentId_societyId: {
          studentId,
          societyId,
        },
      },
    });

    if (!studentMembership) {
      throw new ApiError(
        400,
        "The specified student is not a member of this society."
      );
    }

    // Start a transaction to delete related records first
    await prisma.$transaction([
      prisma.studentSocietyRole.deleteMany({
        where: { studentId, societyId },
      }),
      prisma.studentSociety.delete({
        where: {
          studentId_societyId: {
            studentId,
            societyId,
          },
        },
      }),
    ]);

    // Send email notification in the background
    sendMemberRemovalStatusEmail({
      studentId,
      societyId,
      reason,
    }).catch((error) => {
      console.error("Background email processing failed:", error);
    });

    sendMemberRemovalStatusNotification({
      studentId,
      societyId,
    }).catch((error) => {
      console.error("Background notification processing failed: ", error);
    });

    res
      .status(200)
      .json(
        new ApiResponse(200, null, "Member has been successfully removed.")
      );
  }
);

export const updateSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;
    const { acceptingNewMembers, membersLimit } = req.body;

    if (!societyId) {
      throw new ApiError(400, "Society id is required.");
    }

    const society = await prisma.society.update({
      where: { id: societyId },
      data: { acceptingNewMembers, membersLimit },
      select: {
        id: true,
        name: true,
        description: true,
        acceptingNewMembers: true,
        membersLimit: true,
      },
    });

    if (!society) {
      throw new ApiError(400, "Invalid society id.");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, society, "Settings updated successfully."));
  }
);
