import * as jwt from "jsonwebtoken";

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
