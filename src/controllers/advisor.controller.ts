import bcrypt from "bcryptjs";
import { Request, Response } from "express";

import prisma from "../db";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { sendVerificationEmail } from "../utils/mail";
import { generateAvatarUrlFromInitials, getLocalPath } from "../utils/helpers";
import { UserType } from "../types";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { generateAccessAndRefreshTokens } from "../utils/authHelpers";
import { registerAdvisorService } from "../services/advisor.services";

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
    const { firstName, lastName, displayName, email, password, phone } =
      req.body;

    const advisor = await registerAdvisorService({
      firstName,
      lastName,
      displayName,
      email,
      password,
      phone,
      file: req.file,
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
          201,
          {
            user: { ...advisor, societyName: advisor.society },
            userType: UserType.ADVISOR,
            accessToken,
            refreshToken,
          },
          "Advisor registered successfully and verification code has been sent to your email."
        )
      );
  }
);
