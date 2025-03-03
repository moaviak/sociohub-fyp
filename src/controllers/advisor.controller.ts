import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../db";
import { ApiResponse } from "../utils/ApiResponse";

export const listSocietyAdvisors = asyncHandler(
  async (req: Request, res: Response) => {
    const advisors = await prisma.societyAdvisor.findMany();

    return res
      .status(200)
      .json(
        new ApiResponse(200, advisors, "Society advisors fetched successfully")
      );
  }
);
