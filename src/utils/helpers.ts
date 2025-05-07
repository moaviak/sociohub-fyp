import fs from "fs";
import fetch from "node-fetch";
import { Request } from "express";

import prisma from "../db";
import logger from "../logger/winston.logger";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { uploadOnCloudinary } from "./cloudinary";

/**
 * @param {import("express").Request} req
 * @description **This utility function is responsible for removing unused image files due to the api fail**.
 *
 * **For example:**
 * * This can occur when product is created.
 * * In product creation process the images are getting uploaded before product gets created.
 * * Once images are uploaded and if there is an error creating a product, the uploaded images are unused.
 * * In such case, this function will remove those unused images.
 */
export const removeUnusedMulterImageFilesOnError = (req: Request) => {
  try {
    const multerFile = req.file;
    const multerFiles = req.files;

    if (multerFile) {
      // If there is file uploaded and there is validation error
      // We want to remove that file
      removeLocalFile(multerFile.path);
    }

    if (multerFiles) {
      const filesValueArray = Object.values(
        multerFiles
      ) as Express.Multer.File[][];
      // If there are multiple files uploaded for more than one fields
      // We want to remove those files as well
      filesValueArray.map((fileFields: Express.Multer.File[]) => {
        fileFields.map((fileObject: Express.Multer.File) => {
          removeLocalFile(fileObject.path);
        });
      });
    }
  } catch (error) {
    // fail silently
    logger.error("Error while removing image files: ", error);
  }
};

/**
 *
 * @param {string} localPath
 * @description Removed the local file from the local file system based on the file path
 */
export const removeLocalFile = (localPath: string) => {
  fs.unlink(localPath, (err) => {
    if (err) logger.error("Error while removing local files: ", err);
    else {
      logger.info("Removed local: ", localPath);
    }
  });
};

/**
 *
 * @param {string} fileName
 * @description returns the file's local path in the file system to assist future removal
 */
export const getLocalPath = (fileName: string) => {
  return `public/temp/${fileName}`;
};

/**
 * Extracts the public_id from a Cloudinary resource URL
 * @param url - The full Cloudinary resource URL
 * @returns public_id or null if extraction fails
 */
export const extractPublicId = (url: string): string | null => {
  const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)(\.[a-z]+)?$/);
  return matches ? matches[1] : null;
};

/**
 * Generates a URL for an avatar based on the user's initials, downloads it,
 * and uploads it to Cloudinary.
 * @param firstName - The first name of the user (e.g., "Muhammad")
 * @param lastName - The last name of the user (e.g., "Moavia")
 * @returns A Promise that resolves to the Cloudinary URL of the uploaded avatar
 */
export const generateAndUploadAvatar = async (
  userId: string,
  firstName: string,
  lastName: string
): Promise<string> => {
  try {
    // Generate the avatar URL from initials
    const avatarUrl = generateAvatarUrlFromInitials(firstName, lastName);

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), "public", "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generate a unique filename for the downloaded image
    const uniqueFilename = `${uuidv4()}.png`;
    const localFilePath = path.join(tempDir, uniqueFilename);

    // Download the image
    const response = await fetch(avatarUrl);
    if (!response.ok) {
      throw new Error(`Failed to download avatar: ${response.statusText}`);
    }

    // Save the image locally
    const fileStream = fs.createWriteStream(localFilePath);
    await new Promise<void>((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on("error", (err) => {
        reject(err);
      });
      fileStream.on("finish", () => {
        resolve();
      });
    });

    // Upload the image to Cloudinary
    const cloudinaryResult = await uploadOnCloudinary(localFilePath, userId);

    // Clean up the local file
    fs.unlinkSync(localFilePath);

    return cloudinaryResult?.secure_url || "";
  } catch (error) {
    console.error("Error generating and uploading avatar:", error);
    throw error;
  }
};

/**
 * Generates a URL for an avatar based on the user's initials.
 * @param firstName - The first name of the user (e.g., "Muhammad")
 * @param lastName - The last name of the user (e.g., "Moavia")
 * @returns A URL string for the avatar
 */
export const generateAvatarUrlFromInitials = (
  firstName: string,
  lastName: string
): string => {
  const baseUrl = "https://avatar.iran.liara.run/username";

  return `${baseUrl}?username=${firstName}+${lastName}`;
};

/**
 * Checks if the user have members_management privilege
 * @param userId - User id
 * @param societyId - id of the society
 * @returns A URL string for the avatar
 */
export const haveMembersPrivilege = async (
  userId: string,
  societyId: string
) => {
  // Check if the user is the advisor of the society
  const society = await prisma.society.findUnique({
    where: { id: societyId },
    select: { advisor: { select: { id: true } } },
  });

  if (society?.advisor?.id === userId) {
    return true;
  }

  // Check if the user has the "member_management" privilege
  const studentWithPrivilege = await prisma.studentSocietyRole.findFirst({
    where: {
      studentId: userId,
      societyId,
      role: {
        privileges: {
          some: { key: "member_management" },
        },
      },
    },
    select: { studentId: true },
  });

  return !!studentWithPrivilege;
};

/**
 * Checks if the user have society_settings_management privilege
 * @param userId - User id
 * @param societyId - id of the society
 * @returns A URL string for the avatar
 */
export const haveSettingsPrivilege = async (
  userId: string,
  societyId: string
) => {
  // Check if the user is the advisor of the society
  const society = await prisma.society.findUnique({
    where: { id: societyId },
    select: { advisor: { select: { id: true } } },
  });

  if (society?.advisor?.id === userId) {
    return true;
  }

  // Check if the user has the "member_management" privilege
  const studentWithPrivilege = await prisma.studentSocietyRole.findFirst({
    where: {
      studentId: userId,
      societyId,
      role: {
        privileges: {
          some: { key: "society_settings_management" },
        },
      },
    },
    select: { studentId: true },
  });

  return !!studentWithPrivilege;
};

export const extractRegistrationNo = (registrationNo: string) => {
  const session = registrationNo.substring(0, 2);
  const year = registrationNo.substring(2, 4);
  const degree = registrationNo.substring(5, 8);
  const rollNo = registrationNo.substring(9, 12);

  return { session, year, degree, rollNo };
};
