import { Advisor, Student } from "@prisma/client";
import jwt, { UserJwtPayload } from "jsonwebtoken";
import prisma from "../db";
import { IUser, UserType } from "../types";
import { ApiError } from "../utils/ApiError";
import {
  verifyPassword,
  generateVerificationCode,
  generateAccessAndRefreshTokens,
} from "../utils/authHelpers";
import { sendVerificationEmail } from "../utils/mail";

export const loginUserService = async ({
  email,
  registrationNumber,
  password,
}: {
  email: string;
  registrationNumber: string;
  password: string;
}) => {
  if (!registrationNumber && !email) {
    throw new ApiError(400, "Registration number or email is required");
  }

  const user = registrationNumber
    ? await prisma.student.findUnique({ where: { registrationNumber } })
    : await prisma.advisor.findUnique({ where: { email } });

  const userType = registrationNumber ? UserType.STUDENT : UserType.ADVISOR;

  if (!user) throw new ApiError(404, "User does not exist");

  const isPasswordValid = await verifyPassword(user, password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid user credentials");

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user.id,
    userType
  );

  await handleVerificationFlow(user, userType);

  const userData =
    userType === UserType.ADVISOR
      ? await formatAdvisorData(user as Advisor, email)
      : await formatStudentData(user as Student);

  return { userData, accessToken, refreshToken, userType };
};

const handleVerificationFlow = async (
  user: Student | Advisor,
  userType: UserType
) => {
  if (!user.isEmailVerified) {
    const isExpired =
      !user.emailVerificationExpiry ||
      user.emailVerificationExpiry < new Date();

    if (isExpired) {
      const { code, codeExpiry } = generateVerificationCode();
      await (prisma[userType] as any).update({
        where: { id: user.id },
        data: {
          emailVerificationCode: code,
          emailVerificationExpiry: new Date(codeExpiry),
        },
      });

      await sendVerificationEmail(user.email, {
        displayName: user.firstName || user.lastName || "",
        verificationCode: code,
        userType,
      });
    }
  }
};

const formatAdvisorData = async (user: Advisor, email: string) => {
  let societyName = "";
  if (!user.societyId) {
    const society = await prisma.societyAdvisor.findFirst({ where: { email } });
    societyName = society?.society || "";
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isEmailVerified: user.isEmailVerified,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    societyId: user.societyId,
    societyName,
  };
};

const formatStudentData = async (user: Student | IUser) => {
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
              privileges: {
                select: { key: true },
              },
            },
          },
        },
      },
    },
  });

  const formattedSocieties = societies.map((entry) => {
    const privileges = new Set<string>();
    entry.roles.forEach((r) =>
      r.role.privileges.forEach((p) => privileges.add(p.key))
    );
    return {
      ...entry.society,
      privileges: Array.from(privileges),
    };
  });

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    registrationNumber: user.registrationNumber,
    societies: formattedSocieties,
  };
};

export const refreshAccessTokenService = async (
  incomingRefreshToken: string | undefined
) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as UserJwtPayload;

    const userType = decoded.userType;

    const user = await prisma[userType].findUnique({
      where: { id: decoded.id },
    });

    if (!user) throw new ApiError(401, "Invalid refresh token");

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user.id,
      userType
    );

    await (prisma[userType] as any).update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  } catch (error: any) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
};

export const verifyEmailService = async (email: string, code: string) => {
  if (!code || !email) {
    throw new ApiError(400, "Verification code and email are required");
  }

  const [student, advisor] = await Promise.all([
    prisma.student.findUnique({ where: { email } }),
    prisma.advisor.findUnique({ where: { email } }),
  ]);

  const user = student || advisor;

  if (!user) {
    throw new ApiError(404, "No user found with this email");
  }

  if (
    user.emailVerificationCode !== code ||
    !user.emailVerificationExpiry ||
    user.emailVerificationExpiry < new Date()
  ) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  const userType = student ? UserType.STUDENT : UserType.ADVISOR;

  const verifiedUser = await (prisma[userType] as any).update({
    where: { id: user.id },
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
      ...(userType === UserType.STUDENT && { registrationNumber: true }),
      ...(userType === UserType.ADVISOR && {
        societyId: true,
        displayName: true,
      }),
    },
  });

  return {
    user: verifiedUser,
    userType,
  };
};

export const resendEmailVerificationService = async (authUser: IUser) => {
  const user = await prisma[authUser.userType].findUnique({
    where: { id: authUser.id },
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  if (user.isEmailVerified) {
    throw new ApiError(409, "Email is already verified!");
  }

  const { code, codeExpiry } =
    authUser.userType === UserType.STUDENT
      ? prisma.student.generateVerificationCode()
      : prisma.advisor.generateVerificationCode();

  await (prisma[authUser.userType] as any).update({
    where: { id: user.id },
    data: {
      emailVerificationCode: code,
      emailVerificationExpiry: new Date(codeExpiry),
    },
  });

  await sendVerificationEmail(user.email, {
    displayName: authUser.displayName || authUser.lastName || "",
    verificationCode: code,
    userType: authUser.userType,
  });
};

export const getCurrentUserService = async (user: IUser) => {
  if (user.userType !== UserType.STUDENT) {
    return user;
  }

  return formatStudentData(user);
};
