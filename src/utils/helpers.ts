import fs from "fs";
import { Request } from "express";
import { Advisor, Student } from "@prisma/client";

import prisma from "../db";
import { UserType } from "../types";
import { ApiError } from "./ApiError";
import logger from "../logger/winston.logger";

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

export const generateAccessAndRefreshTokens = async (
  userId: string,
  userType: UserType
) => {
  try {
    const user = await prisma[userType].findUnique({ where: { id: userId } });

    if (!user) throw new ApiError(404, "User not found");

    const accessToken =
      userType === UserType.STUDENT
        ? prisma.student.generateAccessToken(user as Student)
        : prisma.advisor.generateAccessToken(user as Advisor);

    const refreshToken =
      userType === UserType.STUDENT
        ? prisma.student.generateRefreshToken(user as Student)
        : prisma.advisor.generateRefreshToken(user as Advisor);

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
