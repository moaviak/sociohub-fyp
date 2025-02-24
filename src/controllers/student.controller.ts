import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import prisma from "../db";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail";

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
      throw new ApiError(409, "Student already exists", []);
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

    await sendEmail({
      email: student.email,
      subject: "Verify your email",
      mailgenContent: emailVerificationMailgenContent(student.username, code),
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          200,
          { user: student },
          "Student registered successfully and verification code has been sent to your email."
        )
      );
  }
);
