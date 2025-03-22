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
          { user: student, accessToken },
          "Student registered successfully and verification code has been sent to your email."
        )
      );
  }
);
