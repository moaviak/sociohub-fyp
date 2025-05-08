import bcrypt from "bcryptjs";
import { ApiError } from "../utils/ApiError";
import {
  generateAndUploadAvatar,
  generateAvatarUrlFromInitials,
} from "../utils/helpers";
import prisma from "../db";
import { sendVerificationEmail } from "../utils/mail";
import { UserType } from "../types";

interface RegisterStudentInput {
  firstName: string;
  lastName: string;
  email: string;
  registrationNumber: string;
  password: string;
}

export const registerStudentService = async ({
  firstName,
  lastName,
  email,
  registrationNumber,
  password,
}: RegisterStudentInput) => {
  const existingStudent = await prisma.student.findFirst({
    where: {
      OR: [{ email }, { registrationNumber }],
    },
  });

  if (existingStudent?.email === email) {
    throw new ApiError(409, "Student already exists with this email.");
  } else if (existingStudent?.registrationNumber === registrationNumber) {
    throw new ApiError(
      409,
      "Student already exists with this registration number."
    );
  }

  const expectedEmail = `${registrationNumber.toLowerCase()}@cuiatk.edu.pk`;
  if (email !== expectedEmail) {
    throw new ApiError(400, "Email must be an official university email.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const avatar = generateAvatarUrlFromInitials(firstName, lastName);
  const { code, codeExpiry } = prisma.student.generateVerificationCode();

  const student = await prisma.student.create({
    data: {
      firstName,
      lastName,
      email,
      registrationNumber,
      avatar,
      password: hashedPassword,
      emailVerificationCode: code,
      emailVerificationExpiry: new Date(codeExpiry),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatar: true,
      registrationNumber: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await sendVerificationEmail(student.email, {
    displayName: student.lastName,
    verificationCode: code,
    userType: UserType.STUDENT,
  });

  (async () => {
    try {
      // If no file was provided, generate and upload avatar
      const cloudinaryUrl = await generateAndUploadAvatar(
        student.id,
        student.firstName,
        student.lastName
      );

      // Only update if we successfully got a cloudinary URL
      if (cloudinaryUrl) {
        // Update the advisor's avatar in the database
        await prisma.student.update({
          where: { id: student.id },
          data: { avatar: cloudinaryUrl },
        });

        console.log(
          `Background avatar update completed for student: ${student.id}`
        );
      }
    } catch (error) {
      console.error(
        `Background avatar update failed for student: ${student.id}`,
        error
      );
      // The error is logged but not thrown to prevent affecting the main flow
    }
  })();

  return student;
};
