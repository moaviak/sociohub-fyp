import express, { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

import { ApiError } from "../utils/ApiError";
import logger from "../logger/winston.logger";
import { asyncHandler } from "../utils/asyncHandler";
import { removeUnusedMulterImageFilesOnError } from "../utils/helpers";
import Stripe from "stripe";

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

  if (!(error instanceof ApiError)) {
    let statusCode = 500;
    let message = "Something went wrong";

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma error codes
      switch (error.code) {
        case "P2002": // Unique constraint violation
          statusCode = 400;
          message = "Duplicate entry found";
          break;
        case "P2025": // Record not found
          statusCode = 404;
          message = "Record not found";
          break;
        case "P2003": // Foreign key constraint failed
          statusCode = 400;
          message = "Related record not found";
          break;
        default:
          statusCode = 400;
      }
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      // Invalid data provided to Prisma
      statusCode = 400;
      message = "Invalid data provided";
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
      // Database connection issues
      statusCode = 500;
      message = "Database connection error";
    } else if (error instanceof Prisma.PrismaClientRustPanicError) {
      // Unexpected Prisma Client error
      statusCode = 500;
      message = "Internal database error";
    } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      // Unknown Prisma Client error
      statusCode = 500;
      message = "Unexpected database error";
    }

    // Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      if (error.type === "StripeCardError") {
        message = "Payment failed: " + err.message;
        statusCode = 400;
      }

      if (error.type === "StripeInvalidRequestError") {
        statusCode = 400;
        message = "Invalid payment request";
      }
    }

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
