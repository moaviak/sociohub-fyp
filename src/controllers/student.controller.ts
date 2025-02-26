import bcrypt from "bcryptjs";
import { Request, Response } from "express";

import prisma from "../db";
import { UserType } from "../types";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { sendVerificationEmail } from "../utils/mail";
import { generateAccessAndRefreshTokens } from "../utils/helpers";

export const registerStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      firstName,
      lastName,
      username,
      email,
      registrationNumber,
      password,
    } = req.body;

    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [{ email }, { username }, { registrationNumber }],
      },
    });

    if (existingStudent) {
      throw new ApiError(409, "Student already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification code
    const { code, codeExpiry } = prisma.student.generateVerificationCode();

    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        registrationNumber,
        password: hashedPassword,
        emailVerificationCode: code,
        emailVerificationExpiry: new Date(codeExpiry),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        registrationNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await sendVerificationEmail(student.email, {
      username: student.username,
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
