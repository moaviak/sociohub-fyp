import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import prisma from "../db";
import { isAuthUser, IUser } from "../types";
import { ApiError } from "../utils/ApiError";
import { UserLoginType } from "@prisma/client";

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

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "http://localhost:3000/api/auth/google/callback",
      },
      async (_, __, profile, next) => {
        try {
          // check if user with email already exists
          const user = await Promise.all([
            prisma.student.findUnique({
              where: {
                email: profile._json.email,
              },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                username: true,
                loginType: true,
                isEmailVerified: true,
              },
            }),
            prisma.advisor.findUnique({
              where: {
                email: profile._json.email,
              },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                username: true,
                isEmailVerified: true,
              },
            }),
          ]);

          if (user[1]) {
            return next(
              new ApiError(400, "Advisors cannot register with Google.")
            );
          }
          // Check if user is found in either table
          const foundUser = user[0];

          if (foundUser) {
            if (foundUser.loginType !== UserLoginType.GOOGLE) {
              // If user is registered with some other method, we will ask him/her to use the same method as registered.
              return next(
                new ApiError(
                  400,
                  "You have previously registered using email and password. Please use email and password to login."
                )
              );
            } else {
              return next(null, foundUser);
            }
          } else {
            const createdUser = await prisma.student.create({
              data: {
                email: profile._json.email as string,
                firstName: profile._json.given_name || "",
                lastName: profile._json.family_name || "",
                username: profile._json.email?.split("@")[0] as string,
                isEmailVerified: true,
                loginType: UserLoginType.GOOGLE,
                registrationNumber: null,
                password: "",
                // TODO: Add more fields as needed avatar etc.
              },
            });

            if (createdUser) {
              return next(null, createdUser);
            } else {
              return next(
                new ApiError(500, "Error while registering the user")
              );
            }
          }
        } catch (error) {
          console.error("Error during authentication process: ", error);
          return next(new ApiError(500, "Error during authentication process"));
        }
      }
    )
  );
} catch (error) {
  console.error("Error initializing passport:", error);
}
