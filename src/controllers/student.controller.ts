import { Request, Response } from "express";

import prisma from "../db";
import { IUser, UserType } from "../types";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { generateAccessAndRefreshTokens } from "../utils/authHelpers";
import { registerStudentService } from "../services/student.services";

export const registerStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const { firstName, lastName, email, registrationNumber, password } =
      req.body;

    const student = await registerStudentService({
      firstName,
      lastName,
      email,
      registrationNumber,
      password,
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
          201,
          {
            user: student,
            userType: UserType.STUDENT,
            accessToken,
            refreshToken,
          },
          "Student registered successfully and verification code has been sent to your email."
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
