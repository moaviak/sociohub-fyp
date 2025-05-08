import prisma from "../db";
import { IUser } from "../types";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { isAuthUser } from "../types/index";
import {
  getCurrentUserService,
  loginUserService,
  refreshAccessTokenService,
  resendEmailVerificationService,
  verifyEmailService,
} from "../services/auth.service";

export const loginUser = asyncHandler(async (req, res) => {
  const result = await loginUserService(req.body);

  const { userData, accessToken, refreshToken, userType } = result;

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
        { user: userData, userType, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await refreshAccessTokenService(
      req.cookies.refreshToken || req.body.refreshToken
    );

    const { accessToken, refreshToken } = result;

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
          { accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  }
);

export const verifyEmail = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const { email } = req.user as IUser;

  const { user, userType } = await verifyEmailService(email, code);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { user, userType }, "Email verified successfully")
    );
});

export const resendEmailVerification = asyncHandler(async (req, res) => {
  if (!isAuthUser(req.user)) {
    throw new ApiError(401, "Unauthorized request");
  }

  await resendEmailVerificationService(req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Mail has been sent to your mail ID"));
});

export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;

    const responseUser = await getCurrentUserService(user);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: responseUser,
          userType: user.userType,
        },
        "Current user fetched successfully"
      )
    );
  }
);

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;

  await (prisma[user.userType] as any).update({
    where: { id: user.id },
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
