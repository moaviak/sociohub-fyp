import bcrypt from "bcryptjs";
import { Request, Response } from "express";

import prisma from "../db";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { sendVerificationEmail } from "../utils/mail";
import {
  generateAccessAndRefreshTokens,
  generateAvatarUrlFromInitials,
} from "../utils/helpers";
import { UserType } from "../types";

export const listSocietyAdvisors = asyncHandler(
  async (req: Request, res: Response) => {
    const advisors = await prisma.societyAdvisor.findMany();

    return res
      .status(200)
      .json(
        new ApiResponse(200, advisors, "Society advisors fetched successfully")
      );
  }
);

export const registerAdvisor = asyncHandler(
  async (req: Request, res: Response) => {
    const { firstName, lastName, displayName, email, password } = req.body;

    const existingAdvisor = await prisma.advisor.findFirst({
      where: {
        email,
      },
    });

    // check for existing advisor
    if (existingAdvisor?.email === email) {
      throw new ApiError(409, "Advisor already exists with this email.");
    }

    // validate email from list
    const isValidEmail = await prisma.societyAdvisor.findUnique({
      where: { email },
    });

    if (!isValidEmail) {
      throw new ApiError(400, "Invalid email address.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate initials avatar
    const avatar = generateAvatarUrlFromInitials(firstName, lastName);

    // Generate Verification code
    const { code, codeExpiry } = prisma.advisor.generateVerificationCode();

    const advisor = await prisma.advisor.create({
      data: {
        firstName,
        lastName,
        email,
        displayName,
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
        societyId: true,
        displayName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await sendVerificationEmail(advisor.email, {
      displayName: advisor.displayName,
      verificationCode: code,
      userType: "advisor",
    });

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      advisor.id,
      UserType.ADVISOR
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
          {
            user: { ...advisor, societyName: isValidEmail.society },
            userType: UserType.ADVISOR,
            accessToken,
          },
          "Advisor registered successfully and verification code has been sent to your email."
        )
      );
  }
);
