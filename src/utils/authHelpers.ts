import { compare } from "bcryptjs";
import ms, { StringValue } from "ms";
import crypto from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import { Advisor, Student } from "@prisma/client";
import { USER_TEMPORARY_TOKEN_EXPIRY } from "../constants";
import { UserType } from "../types";
import prisma from "../db";
import { ApiError } from "./ApiError";

export const verifyPassword = async (
  user: Student | Advisor,
  password: string
) => {
  return await compare(password, user.password);
};

export const generateVerificationCode = () => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const codeExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;

  return { code, codeExpiry };
};

export const generateTemporaryToken = () => {
  const unHashedToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");
  const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;

  return { unHashedToken, hashedToken, tokenExpiry };
};

const generateAccessToken = (user: Student | Advisor, userType: UserType) => {
  const options: SignOptions = {
    expiresIn: "15m",
  };

  return jwt.sign(
    { id: user.id, email: user.email, userType },
    process.env.ACCESS_TOKEN_SECRET!,
    options
  );
};

const generateRefreshToken = (user: Student | Advisor, userType: UserType) => {
  const options: SignOptions = {
    expiresIn: "7d",
  };
  return jwt.sign(
    { id: user.id, email: user.email, userType },
    process.env.REFRESH_TOKEN_SECRET!,
    options
  );
};

export const generateAccessAndRefreshTokens = async (
  userId: string,
  userType: UserType
) => {
  try {
    const user = await prisma[userType].findUnique({ where: { id: userId } });

    if (!user) throw new ApiError(404, "User not found");

    const accessToken = generateAccessToken(user, userType);

    const refreshToken = generateRefreshToken(user, userType);

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
