import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import {
  getAllUsersService,
  getUserByIdService,
  searchUsersService,
  updateUserProfileService,
} from "../services/user.service";
import { ApiError } from "../utils/ApiError";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary";

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt((req.query.page as string) || "1", 10);
  const limit = parseInt((req.query.limit as string) || "10", 10);
  const search = (req.query.search as string) || "";

  const result = await getAllUsersService({ page, limit, search });

  // Exclude the current logged-in user
  const currentUserId = (req.user as import("../types").IUser)?.id;
  const filteredUsers = result.users.filter((u: any) => u.id !== currentUserId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { ...result, users: filteredUsers }, "Users fetched successfully")
    );
});

export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = (req.query.q as string) || "";
  const currentUserId = (req.user as import("../types").IUser)?.id;

  if (!query) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "Users fetched successfully"));
  }

  const users = await searchUsersService(query, currentUserId);
  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});


export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await getUserByIdService(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});

export const updateUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as import("../types").IUser;
    if (!user?.id) throw new ApiError(401, "Unauthorized");

    const { firstName, lastName, phone, displayName, bio } = req.body;
    let avatar: string | undefined = undefined;

    // Handle avatar upload to Cloudinary
    if (req.file) {
      // Delete previous avatar if present and is a Cloudinary URL
      if (user.avatar && user.avatar.includes("cloudinary")) {
        await deleteFromCloudinary(user.avatar);
      }
      // Upload new avatar
      const uploadResult = await uploadOnCloudinary(
        req.file.path,
        `avatars/${user.id}`,
        "image"
      );
      if (uploadResult && uploadResult.secure_url) {
        avatar = uploadResult.secure_url;
      }
    }

    // Only allow displayName for advisors
    const updateFields: any = { firstName, lastName, phone, bio };
    if (user.userType === "advisor" && displayName !== undefined)
      updateFields.displayName = displayName;
    if (avatar) updateFields.avatar = avatar;

    const updatedUser = await updateUserProfileService(user.id, updateFields);
    if (!updatedUser) throw new ApiError(404, "User not found");

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
  }
);
