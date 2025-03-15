import passport from "passport";

import prisma from "../db";
import { IUser } from "../types";
import { ApiError } from "../utils/ApiError";

try {
  passport.serializeUser((user, next) => {
    next(null, (user as IUser).id);
  });

  passport.deserializeUser(async (id, next) => {
    try {
      const user = await Promise.all([
        prisma.student.findUnique({ where: { id: id as string } }),
        prisma.advisor.findUnique({ where: { id: id as string } }),
      ]);

      if (user[0] || user[1]) {
        next(null, user[0] || user[1]);
      } else {
        next(new ApiError(404, "User does not exist"), null);
      }
    } catch (error) {
      next(
        new ApiError(
          500,
          "Something went wrong while deserializing the user. Error: " + error
        ),
        null
      );
    }
  });
} catch (error) {
  console.error("Error initializing passport:", error);
}
