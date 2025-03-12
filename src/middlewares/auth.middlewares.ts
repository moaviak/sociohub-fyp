import jwt, { UserJwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

import prisma from "../db";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { IUser, UserType } from "../types";
import { Advisor, Student } from "@prisma/client";

export const verifyJWT = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    try {
      const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as UserJwtPayload;

      const user = await prisma[decodedToken.userType].findUnique({
        where: { id: decodedToken.id },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          ...(decodedToken.userType === UserType.STUDENT && {
            registrationNumber: true,
          }),
          ...(decodedToken.userType === UserType.ADVISOR && {
            societyId: true,
          }),
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!user) {
        // Client should make a request to /api/auth/refresh-token if they have refreshToken present in their cookie
        // Then they will get a new access token which will allow them to refresh the access token without logging out the user
        throw new ApiError(401, "Invalid access token");
      }
      req.user = { ...user, userType: decodedToken.userType } as IUser;
      next();
    } catch (error: any) {
      // Client should make a request to /api/auth/refresh-token if they have refreshToken present in their cookie
      // Then they will get a new access token which will allow them to refresh the access token without logging out the user
      throw new ApiError(401, error?.message || "Invalid access token");
    }
  }
);
