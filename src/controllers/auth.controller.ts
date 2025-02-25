import crypto from "crypto";
import jwt, { UserJwtPayload } from "jsonwebtoken";

import prisma from "../db";
import { UserLoginType } from "../constants";
import { UserType } from "../types";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Advisor, Student } from "@prisma/client";

const generateAccessAndRefreshTokens = async (
  userId: string,
  userType: UserType
) => {
  try {
    const user = await prisma[userType].findUnique({ where: { id: userId } });

    if (!user) throw new ApiError(404, "User not found");

    const accessToken =
      userType === UserType.STUDENT
        ? prisma.student.generateAccessToken(user as Student)
        : prisma.advisor.generateAccessToken(user as Advisor);

    const refreshToken =
      userType === UserType.STUDENT
        ? prisma.student.generateRefreshToken(user as Student)
        : prisma.advisor.generateRefreshToken(user as Advisor);

    // Update the user with new refresh token
    await (prisma[userType] as any).update({
      where: { id: userId },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  // Search in both tables simultaneously using Promise.all
  const [student, advisor] = await Promise.all([
    prisma.student.findFirst({
      where: {
        OR: [{ username: username || "" }, { email: email || "" }],
      },
    }),
    prisma.advisor.findFirst({
      where: {
        OR: [{ username: username || "" }, { email: email || "" }],
      },
    }),
  ]);

  // Determine which user exists
  const user = student || advisor;
  const userType = student
    ? UserType.STUDENT
    : advisor
    ? UserType.ADVISOR
    : null;

  if (!user || !userType) {
    throw new ApiError(404, "User does not exist");
  }

  // Add email verification check
  if (!user.isEmailVerified) {
    throw new ApiError(
      403,
      "Please verify your email before logging in. Check your email for verification instructions."
    );
  }

  if (userType === UserType.STUDENT) {
    const studentUser = user as typeof student;
    if (studentUser?.loginType !== UserLoginType.EMAIL_PASSWORD) {
      throw new ApiError(
        400,
        `You have previously registered using ${studentUser?.loginType.toLowerCase()}. Please use the ${studentUser?.loginType.toLowerCase()} login option to access your account.`
      );
    }
  }

  // Verify password
  const isPasswordValid =
    userType === UserType.STUDENT
      ? await prisma.student.verifyPassword(user as Student, password)
      : await prisma.advisor.verifyPassword(user as Advisor, password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user.id,
    userType as UserType
  );

  // Get user data without sensitive information
  const loggedInUser = await prisma[userType].findUnique({
    where: { id: user.id },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      // Add other fields you want to return
      password: false,
      refreshToken: false,
      emailVerificationCode: false,
      emailVerificationExpiry: false,
    },
  });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as UserJwtPayload;

    const user = await prisma[decodedToken.userType].findUnique({
      where: { id: decodedToken.id },
    });

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // check if incoming refresh token is same as the refresh token attached in the user document
    // This shows that the refresh token is used or not
    // Once it is used, we are replacing it with new refresh token below
    if (incomingRefreshToken !== user?.refreshToken) {
      // If token is valid but is used already
      throw new ApiError(401, "Refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user.id, decodedToken.userType);

    // Update the user's refresh token in the database
    await (prisma[decodedToken.userType] as any).update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error: any) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { code, email } = req.body;

  if (!code || !email) {
    throw new ApiError(400, "Verification code and email are required");
  }

  // First find user by email in both tables
  const [student, advisor] = await Promise.all([
    prisma.student.findUnique({
      where: { email },
    }),
    prisma.advisor.findUnique({
      where: { email },
    }),
  ]);

  const user = student || advisor;

  if (!user) {
    throw new ApiError(404, "No user found with this email");
  }

  // Verify the code matches and hasn't expired
  if (
    user.emailVerificationCode !== code ||
    !user.emailVerificationExpiry ||
    user.emailVerificationExpiry < new Date()
  ) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  // Clear verification code and mark email as verified
  const userType = student ? UserType.STUDENT : UserType.ADVISOR;
  await (prisma[userType] as any).update({
    where: {
      id: user.id,
    },
    data: {
      emailVerificationCode: null,
      emailVerificationExpiry: null,
      isEmailVerified: true,
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isEmailVerified: true },
        "Email verified successfully"
      )
    );
});
