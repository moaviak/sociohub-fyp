import ms, { StringValue } from "ms";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient, Student, Advisor } from "@prisma/client";

import { UserType } from "../types";
import { USER_TEMPORARY_TOKEN_EXPIRY } from "../constants";

const prisma = new PrismaClient().$extends(withAccelerate()).$extends({
  model: {
    student: {
      generateAccessToken(student: Student) {
        const options: SignOptions = {
          expiresIn:
            ms(process.env.ACCESS_TOKEN_EXPIRY! as StringValue) || "1d",
        };
        return jwt.sign(
          {
            id: student.id,
            email: student.email,
            username: student.username,
            userType: UserType.STUDENT,
          },
          process.env.ACCESS_TOKEN_SECRET!,
          options
        );
      },
      generateRefreshToken(student: Student) {
        const options: SignOptions = {
          expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRY) || "7d",
        };
        return jwt.sign(
          {
            id: student.id,
            email: student.email,
            username: student.username,
            userType: UserType.STUDENT,
          },
          process.env.REFRESH_TOKEN_SECRET!,
          options
        );
      },
      async verifyPassword(student: Student, candidatePassword: string) {
        return await bcrypt.compare(candidatePassword, student.password);
      },
      /**
       * @description Method responsible for generating tokens for email verification, password reset etc.
       */
      generateTemporaryToken(student: Student) {
        // This token should be client facing
        // for example: for email verification unHashedToken should go into the user's mail
        const unHashedToken = crypto.randomBytes(20).toString("hex");

        // This should stay in the DB to compare at the time of verification
        const hashedToken = crypto
          .createHash("sha256")
          .update(unHashedToken)
          .digest("hex");
        // This is the expiry time for the token (20 minutes)
        const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;

        return { unHashedToken, hashedToken, tokenExpiry };
      },
      /**
       * @description Method responsible for generating verification code for email verification
       */
      generateVerificationCode() {
        // Generate a random 6 digit number
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // This is the expiry time for the code (30 minutes)
        const codeExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;

        return { code, codeExpiry };
      },
    },
    advisor: {
      generateAccessToken(advisor: Advisor) {
        const options: SignOptions = {
          expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRY) || "1d",
        };
        return jwt.sign(
          {
            id: advisor.id,
            email: advisor.email,
            username: advisor.username,
            userType: UserType.ADVISOR,
          },
          process.env.ACCESS_TOKEN_SECRET!,
          options
        );
      },
      generateRefreshToken(advisor: Advisor) {
        const options: SignOptions = {
          expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRY) || "7d",
        };
        return jwt.sign(
          {
            id: advisor.id,
            email: advisor.email,
            username: advisor.username,
            userType: UserType.ADVISOR,
          },
          process.env.REFRESH_TOKEN_SECRET!,
          options
        );
      },
      async verifyPassword(advisor: Advisor, candidatePassword: string) {
        return await bcrypt.compare(candidatePassword, advisor.password);
      },
      /**
       * @description Method responsible for generating tokens for email verification, password reset etc.
       */
      generateTemporaryToken(advisor: Advisor) {
        // This token should be client facing
        // for example: for email verification unHashedToken should go into the user's mail
        const unHashedToken = crypto.randomBytes(20).toString("hex");

        // This should stay in the DB to compare at the time of verification
        const hashedToken = crypto
          .createHash("sha256")
          .update(unHashedToken)
          .digest("hex");
        // This is the expiry time for the token (20 minutes)
        const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;

        return { unHashedToken, hashedToken, tokenExpiry };
      },
      /**
       * @description Method responsible for generating verification code for email verification
       */
      generateVerificationCode() {
        // Generate a random 6 digit number
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // This is the expiry time for the code (20 minutes)
        const codeExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;

        return { code, codeExpiry };
      },
    },
  },
});

export default prisma;
