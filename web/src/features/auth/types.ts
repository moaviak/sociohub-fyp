export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student extends User {
  registrationNumber?: string;
}

export interface Advisor extends User {
  displayName?: string;
  societyId?: string;
  societyName?: string;
}

export enum LOGIN_TYPES {
  EMAIL_PASSWORD = "EMAIL_PASSWORD",
  GOOGLE = "GOOGLE",
}

export type AuthResponse = {
  user: Student | Advisor;
  userType: UserType;
  accessToken?: string;
};

export type SocietyAdvisor = {
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  society: string;
};

export enum UserType {
  STUDENT = "student",
  ADVISOR = "advisor",
}
