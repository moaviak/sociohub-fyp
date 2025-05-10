import { Advisor, Student, UserType } from "@/types";

export type AuthResponse = {
  user: Student | Advisor;
  userType: UserType;
  accessToken?: string;
  refreshToken?: string;
};

export type SocietyAdvisor = {
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  society: string;
};
