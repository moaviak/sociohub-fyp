import * as jwt from "jsonwebtoken";
import { Student, Advisor, UserLoginType } from "@prisma/client";
declare module "jsonwebtoken" {
  export interface UserJwtPayload extends jwt.JwtPayload {
    id: string;
    email: string;
    username: string;
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
  username: string;
  firstName: string;
  lastName: string;
  loginType: UserLoginType;
  userType: UserType;
  createdAt: Date;
  updatedAt: Date;
};

export function isAuthUser(user: any): user is IUser {
  return (
    user &&
    typeof user.id === "string" &&
    typeof user.email === "string" &&
    typeof user.username === "string" &&
    typeof user.firstName === "string" &&
    typeof user.lastName === "string" &&
    typeof user.loginType === "string" &&
    typeof user.userType === "string" &&
    Object.values(UserType).includes(user.userType) &&
    user.createdAt instanceof Date &&
    user.updatedAt instanceof Date
  );
}
