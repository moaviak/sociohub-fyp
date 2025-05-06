import bcrypt from "bcryptjs";
import { Request, Response } from "express";

import prisma from "../db";
import { IUser, UserType } from "../types";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { sendVerificationEmail } from "../utils/mail";
import {
  extractRegistrationNo,
  generateAccessAndRefreshTokens,
  generateAvatarUrlFromInitials,
} from "../utils/helpers";
import { generateJoinRequestPDF } from "../utils/pdf";
import {
  deleteFromCloudinary,
  getDownloadableCloudinaryUrl,
  uploadOnCloudinary,
} from "../utils/cloudinary";

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
    const {
      societyId,
      reason,
      expectations,
      skills,
      whatsappNo,
      semester,
      interestedRole,
    } = req.body;
    const user = req.user as IUser;

    // Fetch user, society, and existing join request in a single query
    const [society, role, existingRequest] = await prisma.$transaction([
      prisma.society.findFirst({
        where: {
          id: societyId,
          members: { none: { studentId: user.id } }, // Ensures user is not already a member
        },
      }),
      prisma.role.findFirst({
        where: { id: interestedRole, societyId },
      }),
      prisma.joinRequest.findFirst({
        where: { studentId: user.id, societyId, status: "PENDING" },
      }),
    ]);

    if (!society) {
      throw new ApiError(400, "Invalid society.");
    }

    if (!society.acceptingNewMembers) {
      throw new ApiError(400, "Society is closed for registration.");
    }

    if (!role) {
      throw new ApiError(400, "Invalid role selected.");
    }

    if (existingRequest) {
      throw new ApiError(
        403,
        "You have already requested to join, please wait for approval."
      );
    }

    if (role?.minSemester && semester < role.minSemester) {
      throw new ApiError(
        400,
        `You must be in semester ${role.minSemester} or higher to apply for this role.`
      );
    }

    const pdfPath = await generateJoinRequestPDF({
      profileImage: user.avatar || "N/A",
      firstName: user.firstName,
      lastName: user.lastName,
      registrationNo: {
        ...extractRegistrationNo(user.registrationNumber || ""),
      },
      email: user.email,
      whatsappNo: whatsappNo,
      semester: semester.toString(),
      role: role.name || "N/A",
      reason: reason,
      expectations: expectations,
      skills: skills || "N/A",
    });

    const uploadResult = await uploadOnCloudinary(
      pdfPath,
      society.name + "/pdfs",
      "raw"
    );

    const pdfUrl = getDownloadableCloudinaryUrl(uploadResult);

    // Create the join request
    const newRequest = await prisma.joinRequest.create({
      data: {
        reason,
        expectations,
        skills,
        studentId: user.id,
        societyId: society.id,
        whatsappNo,
        semester,
        interestedRoleId: role.id,
        pdf: pdfUrl,
      },
      select: {
        id: true,
        studentId: true,
        societyId: true,
        reason: true,
        expectations: true,
        skills: true,
        whatsappNo: true,
        semester: true,
        interestedRoleId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // TODO: Send notification and email to society admins

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
    const { societyId } = req.params;
    const { id: studentId } = req.user as IUser;

    if (!societyId) {
      throw new ApiError(400, "Role ID is required.");
    }

    // Use transaction to check and delete in one go
    const [request] = await prisma.$transaction([
      prisma.joinRequest.findFirst({
        where: { societyId, studentId, status: "PENDING" },
      }),
      prisma.joinRequest.deleteMany({
        where: { societyId, studentId, status: "PENDING" },
      }),
    ]);

    if (!request) {
      throw new ApiError(400, "No join request found.");
    }

    await deleteFromCloudinary(request.pdf || "");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          request,
          "Join request has been successfully canceled."
        )
      );
  }
);

export const getMySocieties = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;

    // Fetch societies where student is a member and include their roles + privileges
    const memberships = await prisma.studentSociety.findMany({
      where: {
        studentId: user.id,
      },
      select: {
        society: {
          select: {
            id: true,
            name: true,
            description: true,
            logo: true,
            createdAt: true,
            updatedAt: true,
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

    // Format response
    const formattedSocieties = memberships.map((membership) => {
      const allPrivileges = membership.roles.flatMap((r) =>
        r.role.privileges.map((p) => p.key)
      );
      const uniquePrivileges = [...new Set(allPrivileges)];

      return {
        ...membership.society,
        privileges: uniquePrivileges,
      };
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          formattedSocieties,
          "Student societies with privileges fetched."
        )
      );
  }
);
