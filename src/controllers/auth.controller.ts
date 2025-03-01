import jwt, { UserJwtPayload } from "jsonwebtoken";

import prisma from "../db";
import { UserLoginType } from "../constants";
import { IUser, UserType } from "../types";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Advisor, Student } from "@prisma/client";
import { sendVerificationEmail } from "../utils/mail";
import { generateAccessAndRefreshTokens } from "../utils/helpers";
import { Request, Response } from "express";
import { isAuthUser } from "../types/index";

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

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  // Check email verification status
  if (!user.isEmailVerified) {
    // Check if verification code is expired
    const isVerificationExpired =
      !user.emailVerificationExpiry ||
      user.emailVerificationExpiry < new Date();

    if (isVerificationExpired) {
      // Generate verification code
      const { code, codeExpiry } =
        userType === UserType.STUDENT
          ? prisma.student.generateVerificationCode()
          : prisma.advisor.generateVerificationCode();

      // Update user with new verification details
      await (prisma[userType] as any).update({
        where: { id: user.id },
        data: {
          emailVerificationCode: code,
          emailVerificationExpiry: new Date(codeExpiry),
        },
      });

      await sendVerificationEmail(user.email, {
        username: user.username,
        verificationCode: code,
        userType: userType,
      });
    }
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          accessToken,
        },
        "User logged in successfully"
      )
    );
});

export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
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
        .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
    } catch (error: any) {
      throw new ApiError(401, error?.message || "Invalid refresh token");
    }
  }
);

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
  const verifiedUser = await (prisma[userType] as any).update({
    where: {
      id: user.id,
    },
    data: {
      emailVerificationCode: null,
      emailVerificationExpiry: null,
      isEmailVerified: true,
    },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      isEmailVerified: true,
      // Exclude sensitive fields
      password: false,
      refreshToken: false,
      emailVerificationCode: false,
      emailVerificationExpiry: false,
    },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: verifiedUser,
      },
      "Email verified successfully"
    )
  );
});

export const resendEmailVerification = asyncHandler(
  async (req: Request, res: Response) => {
    if (!isAuthUser(req.user)) {
      throw new ApiError(401, "Unauthorized request");
    }

    const user = await prisma[req.user.userType].findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      throw new ApiError(404, "User does not exists", []);
    }

    // if email is already verified throw an error
    if (user.isEmailVerified) {
      throw new ApiError(409, "Email is already verified!");
    }

    const { code, codeExpiry } =
      req.user.userType === UserType.STUDENT
        ? prisma.student.generateVerificationCode()
        : prisma.advisor.generateVerificationCode();

    console.log({ code, codeExpiry });

    await (prisma[req.user.userType] as any).update({
      where: { id: user.id },
      data: {
        emailVerificationCode: code,
        emailVerificationExpiry: new Date(codeExpiry),
      },
    });

    await sendVerificationEmail(user.email, {
      username: user.username,
      verificationCode: code,
      userType: req.user.userType,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Mail has been sent to your mail ID"));
  }
);

export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { user: req.user, accessToken: req.cookies?.accessToken || "" },
          "Current user fetched successfully"
        )
      );
  }
);

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  if (!isAuthUser(req.user)) {
    throw new ApiError(401, "Unauthorized request");
  }

  await (prisma[req.user?.userType] as any).update({
    where: { id: req.user?.id },
    data: {
      refreshToken: "",
    },
  });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

export const handleGoogleLogin = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await prisma.student.findUnique({
      where: { id: (req.user as IUser).id },
    });

    if (!user) {
      throw new ApiError(404, "User does not exist");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user.id,
      UserType.STUDENT
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    if (user.registrationNumber) {
      return res
        .status(301)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .redirect(process.env.CLIENT_SSO_REDIRECT_URL! + "/dashboard");
    } else {
      return res
        .status(301)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .redirect(
          process.env.CLIENT_SSO_REDIRECT_URL! + "/sign-up/student/reg-no"
        );
    }
  }
);
