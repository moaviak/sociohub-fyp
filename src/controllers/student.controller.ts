import bcrypt from "bcryptjs";
import { Request, Response } from "express";

import prisma from "../db";
import { IUser, UserType } from "../types";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { sendVerificationEmail } from "../utils/mail";
import {
  generateAccessAndRefreshTokens,
  generateAvatarUrlFromInitials,
} from "../utils/helpers";

export const registerStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const { firstName, lastName, email, registrationNumber, password } =
      req.body;

    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [{ email }, { registrationNumber }],
      },
    });

    if (existingStudent?.email === email) {
      throw new ApiError(409, "Student already exists with this email.");
    } else if (existingStudent?.registrationNumber === registrationNumber) {
      throw new ApiError(
        409,
        "Student already exists with this registration number."
      );
    }

    const emailDomain = `${registrationNumber.toLowerCase()}@cuiatk.edu.pk`;
    if (email !== emailDomain) {
      throw new ApiError(400, "Email must be an official university email.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate initials avatar
    const avatar = generateAvatarUrlFromInitials(firstName, lastName);

    // Generate verification code
    const { code, codeExpiry } = prisma.student.generateVerificationCode();

    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        email,
        registrationNumber,
        avatar,
        password: hashedPassword,
        emailVerificationCode: code,
        emailVerificationExpiry: new Date(codeExpiry),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        registrationNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await sendVerificationEmail(student.email, {
      displayName: student.lastName,
      verificationCode: code,
      userType: "student",
    });

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      student.id,
      UserType.STUDENT
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user: student, userType: UserType.STUDENT, accessToken },
          "Student registered successfully and verification code has been sent to your email."
        )
      );
  }
);

export const sendJoinRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { societyId, reason, expectations, skills } = req.body;
    const { id } = req.user as IUser;

    // Fetch user, society, and existing join request in a single query
    const [society, existingRequest] = await prisma.$transaction([
      prisma.society.findFirst({
        where: {
          id: societyId,
          members: { none: { studentId: id } }, // Ensures user is not already a member
        },
      }),
      prisma.joinRequest.findFirst({
        where: { studentId: id, societyId },
      }),
    ]);

    if (!society) {
      throw new ApiError(400, "Invalid society.");
    }

    if (existingRequest) {
      throw new ApiError(
        403,
        "You have already requested to join, please wait for approval."
      );
    }

    // Create the join request
    const newRequest = await prisma.joinRequest.create({
      data: {
        reason,
        expectations,
        skills,
        studentId: id,
        societyId: society.id,
      },
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          200,
          newRequest,
          "Join Request has been successfully sent."
        )
      );
  }
);

export const cancelJoinRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { id: studentId } = req.user as IUser;
    const { societyId } = req.params;

    if (!societyId) {
      throw new ApiError(400, "Society ID is required.");
    }

    // Use transaction to check and delete in one go
    const [request] = await prisma.$transaction([
      prisma.joinRequest.findUnique({
        where: { studentId_societyId: { studentId, societyId } },
      }),
      prisma.joinRequest.deleteMany({
        where: { studentId, societyId },
      }),
    ]);

    if (!request) {
      throw new ApiError(400, "No join request found.");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "Join request has been successfully canceled."
        )
      );
  }
);
