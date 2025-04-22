import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { IUser, RequestAction } from "../types";
import prisma from "../db";
import { ApiError } from "../utils/ApiError";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { getLocalPath, haveMembersPrivilege } from "../utils/helpers";
import { ApiResponse } from "../utils/ApiResponse";

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
        _count: {
          select: {
            members: true, // Count of members
            joinRequests: true, // Count of join requests
          },
        },
        members: {
          where: { studentId: user.id }, // Check if user is a member
          select: { studentId: true },
        },
        joinRequests: {
          where: { studentId: user.id }, // Check if user has sent a join request
          select: { studentId: true },
        },
      },
    });

    // Modify each society object to include membership/request status
    const societiesWithStatus = societies.map((society) => ({
      ...society,
      isMember: society.members.length > 0, // If the user is found in members, they're a member
      hasRequestedToJoin: society.joinRequests.length > 0, // If the user is found in joinRequests, they've requested to join
      members: undefined, // Remove members array
      joinRequests: undefined, // Remove joinRequests array
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

export const getSocietyRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;
    const user = req.user as IUser;

    if (!societyId) {
      throw new ApiError(400, "Society ID is required.");
    }

    // Fetch society with advisor details
    const society = await prisma.society.findUnique({
      where: { id: societyId },
      select: {
        id: true,
        name: true,
        advisor: {
          select: { id: true },
        },
      },
    });

    if (!society) {
      throw new ApiError(400, "Invalid Society ID.");
    }

    let isAuthorized = haveMembersPrivilege(user.id, society.id);

    if (!isAuthorized) {
      throw new ApiError(
        403,
        "You are not authorized to access this society's requests."
      );
    }

    // Fetch join requests
    const requests = await prisma.joinRequest.findMany({
      where: { societyId: society.id },
      orderBy: { createdAt: "desc" },
      select: {
        studentId: true,
        societyId: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            registrationNumber: true,
          },
        },
        reason: true,
        expectations: true,
        skills: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(200, requests, "Society requests successfully fetched.")
      );
  }
);

export const handleRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId } = req.params;
    const { studentId, action } = req.body;
    const user = req.user as IUser;

    if (!societyId || !studentId) {
      throw new ApiError(400, "Society ID and Student ID are required.");
    }

    // Fetch join request
    const request = await prisma.joinRequest.findUnique({
      where: { studentId_societyId: { studentId, societyId } },
    });

    if (!request) {
      throw new ApiError(400, "No pending join request found.");
    }

    if (action === RequestAction.ACCEPT) {
      // Accept request: Add student to society (StudentSociety), assign Member role, and remove join request
      const role = await prisma.role.findFirst({
        where: {
          name: "Member",
          societyId,
        },
      });

      if (!role) {
        throw new ApiError(500, "Member role not found for the society.");
      }

      await prisma.$transaction([
        prisma.studentSociety.create({
          data: {
            studentId,
            societyId,
          },
        }),
        prisma.studentSocietyRole.create({
          data: {
            roleId: role.id,
            societyId,
            studentId,
          },
        }),
        prisma.joinRequest.delete({
          where: { studentId_societyId: { studentId, societyId } },
        }),
      ]);

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            null,
            "Student has been successfully added to the society."
          )
        );
    } else if (action === RequestAction.REJECT) {
      // Reject request: Just delete the join request
      await prisma.joinRequest.delete({
        where: { studentId_societyId: { studentId, societyId } },
      });

      return res
        .status(200)
        .json(new ApiResponse(200, null, "Join request has been rejected."));
    }

    throw new ApiError(400, "Invalid action specified.");
  }
);

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
    const { studentId } = req.body;
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

    res
      .status(200)
      .json(
        new ApiResponse(200, null, "Member has been successfully removed.")
      );
  }
);
