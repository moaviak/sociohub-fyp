import jwt, { UserJwtPayload } from "jsonwebtoken";

import prisma from "../db";
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
  const { email, registrationNumber, password } = req.body;

  if (!registrationNumber && !email) {
    throw new ApiError(400, "Registration number or email is required");
  }

  let student = null;
  let advisor = null;

  if (registrationNumber) {
    student = await prisma.student.findUnique({
      where: { registrationNumber },
    });
  } else {
    advisor = await prisma.advisor.findUnique({ where: { email } });
  }

  const user = student || advisor;
  const userType = student
    ? UserType.STUDENT
    : advisor
    ? UserType.ADVISOR
    : null;

  if (!user || !userType) {
    throw new ApiError(404, "User does not exist");
  }

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

  if (!user.isEmailVerified) {
    const isVerificationExpired =
      !user.emailVerificationExpiry ||
      user.emailVerificationExpiry < new Date();

    if (isVerificationExpired) {
      const { code, codeExpiry } =
        userType === UserType.STUDENT
          ? prisma.student.generateVerificationCode()
          : prisma.advisor.generateVerificationCode();

      await (prisma[userType] as any).update({
        where: { id: user.id },
        data: {
          emailVerificationCode: code,
          emailVerificationExpiry: new Date(codeExpiry),
        },
      });

      await sendVerificationEmail(user.email, {
        displayName: advisor?.displayName || student?.lastName || "",
        verificationCode: code,
        userType: userType,
      });
    }
  }

  // ✅ Advisor response
  if (userType === UserType.ADVISOR) {
    let responseData = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        societyId: (user as Advisor).societyId,
        societyName: "",
      },
    };

    if (!(user as Advisor).societyId) {
      const society = await prisma.societyAdvisor.findFirst({
        where: { email },
      });

      responseData.user.societyName = society?.society || "";
    }

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            ...responseData,
            userType,
            accessToken,
          },
          "User logged in successfully"
        )
      );
  }

  // ✅ Student response with societies & privileges
  const societies = await prisma.studentSociety.findMany({
    where: { studentId: user.id },
    select: {
      society: {
        select: {
          id: true,
          name: true,
          description: true,
          logo: true,
        },
      },
      roles: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
              privileges: {
                select: {
                  key: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const formattedSocieties = societies.map((entry) => {
    const privilegesSet = new Set<string>();

    entry.roles.forEach((r) => {
      r.role.privileges.forEach((p) => {
        privilegesSet.add(p.key);
      });
    });

    return {
      ...entry.society,
      privileges: Array.from(privilegesSet),
    };
  });

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
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            registrationNumber: (user as Student).registrationNumber,
            societies: formattedSocieties,
          },
          userType,
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
  const { code } = req.body;

  if (!isAuthUser(req.user)) {
    throw new ApiError(401, "Unauthorized request");
  }
  const { email } = req.user;

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
      email: true,
      firstName: true,
      lastName: true,
      isEmailVerified: true,
      avatar: true,
      ...(userType === UserType.STUDENT && { registrationNumber: true }), // Only include for Student
      ...(userType === UserType.ADVISOR && {
        societyId: true,
        displayName: true,
      }), // Only include for Advisor
    },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          ...verifiedUser,
          ...(userType === UserType.STUDENT && {
            registrationNumber: (user as Student).registrationNumber,
          }),
          ...(userType === UserType.ADVISOR && {
            societyId: (user as Advisor).societyId,
          }),
        },
        userType,
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
      displayName: req.user.displayName || req.user.lastName,
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
    const user = req.user as IUser;

    let responseUser: any = { ...user };
    let societies = [];

    if (user.userType === UserType.STUDENT) {
      // Fetch societies and privileges for student
      const studentSocieties = await prisma.studentSociety.findMany({
        where: { studentId: user.id },
        select: {
          society: {
            select: {
              id: true,
              name: true,
              description: true,
              logo: true,
            },
          },
          roles: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                  privileges: {
                    select: {
                      key: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      societies = studentSocieties.map((entry) => {
        const privilegeSet = new Set<string>();

        entry.roles.forEach((r) => {
          r.role.privileges.forEach((p) => {
            privilegeSet.add(p.key);
          });
        });

        return {
          ...entry.society,
          privileges: Array.from(privilegeSet),
        };
      });

      responseUser = {
        ...user,
        societies,
      };
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: responseUser,
          accessToken: req.cookies?.accessToken || "",
          userType: user.userType,
        },
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
