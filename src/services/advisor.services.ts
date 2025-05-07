import prisma from "../db";
import bcrypt from "bcryptjs";
import { ApiError } from "../utils/ApiError";
import { uploadOnCloudinary } from "../utils/cloudinary";
import {
  generateAndUploadAvatar,
  generateAvatarUrlFromInitials,
  getLocalPath,
} from "../utils/helpers";
import { sendVerificationEmail } from "../utils/mail";
import { UserType } from "../types";

interface RegisterAdvisorInput {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  password: string;
  phone?: string;
  file?: Express.Multer.File;
}

export const registerAdvisorService = async ({
  firstName,
  lastName,
  displayName,
  email,
  password,
  phone,
  file,
}: RegisterAdvisorInput) => {
  const existingAdvisor = await prisma.advisor.findUnique({ where: { email } });
  if (existingAdvisor) {
    throw new ApiError(409, "Advisor already exists with this email.");
  }

  const validAdvisor = await prisma.societyAdvisor.findUnique({
    where: { email },
  });
  if (!validAdvisor) {
    throw new ApiError(400, "Invalid email address.");
  }

  // Set an initial avatar from initials - will be used while the actual avatar processes in background
  const avatar = generateAvatarUrlFromInitials(firstName, lastName);

  const hashedPassword = await bcrypt.hash(password, 10);
  const { code, codeExpiry } = prisma.advisor.generateVerificationCode();

  const advisor = await prisma.advisor.create({
    data: {
      firstName,
      lastName,
      email,
      displayName,
      phone: phone || null,
      password: hashedPassword,
      avatar,
      emailVerificationCode: code,
      emailVerificationExpiry: new Date(codeExpiry),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatar: true,
      societyId: true,
      displayName: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Send verification email
  await sendVerificationEmail(advisor.email, {
    displayName: advisor.displayName,
    verificationCode: code,
    userType: UserType.ADVISOR,
  });

  // Process avatar in the background (whether from file or generated)
  (async () => {
    try {
      let cloudinaryUrl = "";

      if (file?.filename) {
        // If file was uploaded, process it in background
        const avatarPath = getLocalPath(file.filename);
        const uploadResult = await uploadOnCloudinary(
          avatarPath,
          advisor.email
        );
        cloudinaryUrl = uploadResult?.secure_url || "";
      } else {
        // If no file was provided, generate and upload avatar
        cloudinaryUrl = await generateAndUploadAvatar(
          advisor.id,
          advisor.firstName,
          advisor.lastName
        );
      }

      // Only update if we successfully got a cloudinary URL
      if (cloudinaryUrl) {
        // Update the advisor's avatar in the database
        await prisma.advisor.update({
          where: { id: advisor.id },
          data: { avatar: cloudinaryUrl },
        });

        console.log(
          `Background avatar update completed for advisor: ${advisor.id}`
        );
      }
    } catch (error) {
      console.error(
        `Background avatar update failed for advisor: ${advisor.id}`,
        error
      );
      // The error is logged but not thrown to prevent affecting the main flow
    }
  })();

  return { ...advisor, society: validAdvisor.society };
};
