import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { haveMembersPrivilege } from "../utils/helpers";
import { IUser } from "../types";
import { ApiError } from "../utils/ApiError";

export const verifyMemberPrivilege = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as IUser).id;
    const { societyId, id } = req.params;

    if (await haveMembersPrivilege(userId, societyId || id)) {
      next();
    } else {
      throw new ApiError(403, "You don't have permission for this operation.");
    }
  }
);
