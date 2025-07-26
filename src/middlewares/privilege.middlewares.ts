import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  haveAnnouncementsPrivilege,
  haveContentPrivilege,
  haveEventsPrivilege,
  haveMeetingsPrivilege,
  haveMembersPrivilege,
  havePaymentsPrivilege,
  haveSettingsPrivilege,
  haveTaskPrivilege,
  haveTeamsPrivlege,
  haveTicketHandlingPrivilege,
} from "../utils/helpers";
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

export const verifySettingsPrivilege = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as IUser).id;
    const { societyId, id } = req.params;

    if (await haveSettingsPrivilege(userId, societyId || id)) {
      next();
    } else {
      throw new ApiError(403, "You don't have permission for this operation.");
    }
  }
);

export const verifyEventsPrivilege = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as IUser).id;
    const { societyId } = req.body;

    if (!societyId) {
      throw new ApiError(403, "You don't have permission for this operation.");
    }

    if (await haveEventsPrivilege(userId, societyId)) {
      next();
    } else {
      throw new ApiError(403, "You don't have permission for this operation.");
    }
  }
);

export const verifyTicketHandlingPrivilege = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as IUser).id;
    const { societyId } = req.body;

    if (!societyId) {
      throw new ApiError(403, "You don't have permission for this operation.");
    }

    if (await haveTicketHandlingPrivilege(userId, societyId)) {
      next();
    } else {
      throw new ApiError(403, "You don't have permission for this operation.");
    }
  }
);

export const verifyAnnouncementsPrivilege = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as IUser).id;
    const { societyId } = req.body;

    if (!societyId) {
      throw new ApiError(403, "You don't have permission for this operation.");
    }

    if (await haveAnnouncementsPrivilege(userId, societyId)) {
      next();
    } else {
      throw new ApiError(403, "You don't have permission for this operation.");
    }
  }
);

export const verifyMeetingsPrivilege = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as IUser).id;
    const { societyId } = req.body;

    if (!societyId) {
      throw new ApiError(403, "You don't have permission for this operation.");
    }

    if (await haveMeetingsPrivilege(userId, societyId)) {
      next();
    } else {
      throw new ApiError(403, "You don't have permission for this operation.");
    }
  }
);

export const verifyPaymentsPrivilege = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as IUser).id;
    const { societyId } = req.body;

    if (!societyId) {
      throw new ApiError(403, "You don't have permission for this operation.");
    }

    if (await havePaymentsPrivilege(userId, societyId)) {
      next();
    } else {
      throw new ApiError(403, "You don't have permission for this operation.");
    }
  }
);

export const verifyContentPrivilege = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as IUser).id;
    const { societyId } = req.body;

    if (!societyId) {
      throw new ApiError(403, "You don't have permission for this operation.");
    }

    if (await haveContentPrivilege(userId, societyId)) {
      next();
    } else {
      throw new ApiError(403, "You don't have permission for this operation.");
    }
  }
);

export const verifyTeamsPrivilege = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as IUser).id;
    const { societyId } = req.body;

    if (!societyId) {
      throw new ApiError(403, "You don't have permission for this operation.");
    }

    if (await haveTeamsPrivlege(userId, societyId)) {
      next();
    } else {
      throw new ApiError(403, "You don't have permission for this operation.");
    }
  }
);

export const verifyTasksPrivilege = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as IUser).id;
    const { societyId } = req.body;

    if (!societyId) {
      throw new ApiError(403, "You don't have permission for this operation.");
    }

    if (await haveTaskPrivilege(userId, societyId)) {
      next();
    } else {
      throw new ApiError(403, "You don't have permission for this operation.");
    }
  }
);
