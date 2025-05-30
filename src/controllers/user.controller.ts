import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { getAllUsersService } from "../services/user.service";

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt((req.query.page as string) || "1", 10);
  const limit = parseInt((req.query.limit as string) || "10", 10);
  const search = (req.query.search as string) || "";

  const result = await getAllUsersService({ page, limit, search });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Users fetched successfully"));
});
