import express, { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

import { ApiError } from "../utils/ApiError";
import logger from "../logger/winston.logger";
import { asyncHandler } from "../utils/asyncHandler";
import { removeUnusedMulterImageFilesOnError } from "../utils/helpers";

interface CustomError extends Error {
  statusCode?: number;
  errors?: any[];
}

/**
 *
 * @param {Error | ApiError} err
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 *
 *
 * @description This middleware is responsible to catch the errors from any request handler wrapped inside the {@link asyncHandler}
 */
const errorHandler: express.ErrorRequestHandler = (
  err: CustomError | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err;

  // Check if the error is an instance of an ApiError class which extends native Error class
  if (!(error instanceof ApiError)) {
    // if not
    // create a new ApiError instance to keep the consistency

    // assign an appropriate status code based on Prisma error types
    let statusCode = 500;

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Common Prisma errors like unique constraint violations (P2002)
      statusCode = 400;
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      // Invalid data provided to Prisma
      statusCode = 400;
    }

    const message = error.message || "Something went wrong";
    error = new ApiError(
      statusCode,
      message,
      "errors" in error ? error.errors : [],
      err.stack
    );
  }

  // Now we are sure that the `error` variable will be an instance of ApiError class
  const response = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}), // Error stack traces should be visible in development for debugging
  };

  logger.error(`${error.message}`);

  removeUnusedMulterImageFilesOnError(req);
  // Send error response
  res.status(error.statusCode || 500).json(response);
};

export { errorHandler };
