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

    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        registrationNumber,
        password: hashedPassword,
      },
    });

    const { unHashedToken, hashedToken, tokenExpiry } =
      prisma.student.generateTemporaryToken(student);

    const createdStudent = await prisma.student.update({
      where: { id: student.id },
      data: {
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: new Date(tokenExpiry),
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
      email: createdStudent.email,
      subject: "Verify your email",
      mailgenContent: emailVerificationMailgenContent(
        student.username,
        `${req.protocol}://${req.get(
          "host"
        )}/api/auth/verify-email/${unHashedToken}`
      ),
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          200,
          { user: createdStudent },
          "Student registered successfully and verification email has been sent on your email."
        )
      );
  }
);
