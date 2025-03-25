import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { IUser } from "../types";
import prisma from "../db";
import { ApiError } from "../utils/ApiError";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { getLocalPath } from "../utils/helpers";
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
