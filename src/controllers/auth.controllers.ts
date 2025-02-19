import bcrypt from "bcryptjs";

import prisma from "../db";
import { UserLoginType } from "../constants";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Advisor, Student } from "@prisma/client";

const generateAccessAndRefreshTokens = async (
  userId: string,
  userType: "student" | "advisor"
) => {
  try {
    const user =
      userType === "student"
        ? await prisma.student.findUnique({ where: { id: userId } })
        : await prisma.advisor.findUnique({ where: { id: userId } });

    if (!user) throw new ApiError(404, "User not found");

    const accessToken =
      userType === "student"
        ? prisma.student.generateAccessToken(user as Student)
        : prisma.advisor.generateAccessToken(user as Advisor);

    const refreshToken =
      userType === "student"
        ? prisma.student.generateRefreshToken(user as Student)
        : prisma.advisor.generateRefreshToken(user as Advisor);

    // Update the user with new refresh token
    await (userType === "student"
      ? prisma.student.update({
          where: { id: userId },
          data: { refreshToken },
        })
      : prisma.advisor.update({
          where: { id: userId },
          data: { refreshToken },
        }));

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
  const userType = student ? "student" : advisor ? "advisor" : null;

  if (!user || !userType) {
    throw new ApiError(404, "User does not exist");
  }

  if (userType === "student") {
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
    userType === "student"
      ? await prisma.student.verifyPassword(user as Student, password)
      : await prisma.advisor.verifyPassword(user as Advisor, password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user.id,
    userType
  );

  // Get user data without sensitive information
  const loggedInUser = await (userType === "student"
    ? prisma.student.findUnique({
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
          emailVerificationToken: false,
          emailVerificationExpiry: false,
        },
      })
    : prisma.advisor.findUnique({
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
          emailVerificationToken: false,
          emailVerificationExpiry: false,
        },
      }));

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
