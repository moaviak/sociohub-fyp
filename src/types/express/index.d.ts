import { IUser } from "../index";
import { Student, Advisor } from "@prisma/client";
import { UserType } from "..";

declare global {
  namespace Express {
    export interface Request {
      user?: IUser;
    }
  }
}
