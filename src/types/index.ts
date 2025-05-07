import * as jwt from "jsonwebtoken";
import { Student, Advisor } from "@prisma/client";
declare module "jsonwebtoken" {
  export interface UserJwtPayload extends jwt.JwtPayload {
    id: string;
    email: string;
    userType: UserType;
  }
}

export enum UserType {
  STUDENT = "student",
  ADVISOR = "advisor",
}
export type IUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatar?: string;
  isEmailVerified: boolean;
  registrationNumber?: string;
  societyId?: string;
  userType: UserType;
  createdAt: Date;
  updatedAt: Date;
};

export function isAuthUser(user: any): user is IUser {
  return (
    user &&
    typeof user.id === "string" &&
    typeof user.email === "string" &&
    typeof user.firstName === "string" &&
    typeof user.lastName === "string" &&
    typeof user.userType === "string" &&
    Object.values(UserType).includes(user.userType) &&
    user.createdAt instanceof Date &&
    user.updatedAt instanceof Date
  );
}

export enum RequestAction {
  ACCEPT = "accept",
  REJECT = "reject",
}
