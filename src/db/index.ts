import ms, { StringValue } from "ms";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient, Student, Advisor } from "@prisma/client";

import { UserType } from "../types";
import { USER_TEMPORARY_TOKEN_EXPIRY } from "../constants";

/**
 * Generates an access token for a user
 */
const generateAccessToken = (user: Student | Advisor, userType: UserType) => {
  const options: SignOptions = {
    expiresIn: ms(process.env.ACCESS_TOKEN_EXPIRY! as StringValue) || "1d",
  };
  return jwt.sign(
    { id: user.id, email: user.email, userType },
    process.env.ACCESS_TOKEN_SECRET!,
    options
  );
};

/**
 * Generates a refresh token for a user
 */
const generateRefreshToken = (user: Student | Advisor, userType: UserType) => {
  const options: SignOptions = {
    expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRY) || "7d",
  };
  return jwt.sign(
    { id: user.id, email: user.email, userType },
    process.env.REFRESH_TOKEN_SECRET!,
    options
  );
};

/**
 * Verifies a given password against a user's hashed password
 */
const verifyPassword = async (
  user: Student | Advisor,
  candidatePassword: string
) => {
  return await bcrypt.compare(candidatePassword, user.password);
};

/**
 * Generates a temporary token for email verification, password reset, etc.
 */
const generateTemporaryToken = () => {
  const unHashedToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");
  const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;

  return { unHashedToken, hashedToken, tokenExpiry };
};

/**
 * Generates a 6-digit verification code for email verification
 */
const generateVerificationCode = () => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const codeExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;

  return { code, codeExpiry };
};

const prisma = new PrismaClient().$extends(withAccelerate()).$extends({
  name: "customMethods", // Give your extension a name
  model: {
    student: {
      generateAccessToken(student: Student) {
        return generateAccessToken(student, UserType.STUDENT);
      },
      generateRefreshToken(student: Student) {
        return generateRefreshToken(student, UserType.STUDENT);
      },
      verifyPassword(student: Student, candidatePassword: string) {
        return verifyPassword(student, candidatePassword);
      },
      generateTemporaryToken,
      generateVerificationCode,
    },
    advisor: {
      generateAccessToken(advisor: Advisor) {
        return generateAccessToken(advisor, UserType.ADVISOR);
      },
      generateRefreshToken(advisor: Advisor) {
        return generateRefreshToken(advisor, UserType.ADVISOR);
      },
      verifyPassword(advisor: Advisor, candidatePassword: string) {
        return verifyPassword(advisor, candidatePassword);
      },
      generateTemporaryToken,
      generateVerificationCode,
    },
  },
});

export default prisma;
