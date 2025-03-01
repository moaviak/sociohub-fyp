import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import prisma from "../db";
import { isAuthUser, IUser } from "../types";
import { ApiError } from "../utils/ApiError";
import { UserLoginType } from "@prisma/client";

try {
  passport.serializeUser((user, next) => {
    next(null, user);
  });

  passport.deserializeUser((user, next) => {
    next(null, user as IUser);
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "http://localhost:3000/api/auth/google/callback",
      },
      async (_, __, profile, next) => {
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
            // TODO: We can redirect user to appropriate frontend urls which will show users what went wrong instead of sending response from the backend
            next(
              new ApiError(
                400,
                "You have previously registered using email and password. Please use email and password to login."
              )
            );
          } else {
            next(null, foundUser);
          }

          // TODO: If same google account is used by advisor as pre-defined list of advisors, we will accept it and redirect it to more society information page.
        } else {
          const createdUser = await prisma.student.create({
            data: {
              email: profile._json.email as string,
              firstName: profile._json.given_name || "",
              lastName: profile._json.family_name || "",
              username: profile._json.email?.split("@")[0] as string,
              isEmailVerified: true,
              loginType: UserLoginType.GOOGLE,
              registrationNumber: "",
              password: "",
              // TODO: Add more fields as needed avatar etc.
            },
          });

          if (createdUser) {
            next(null, createdUser);
          } else {
            next(new ApiError(500, "Error while registering the user"));
          }

          next(null, createdUser);
        }
      }
    )
  );
} catch (error) {}
