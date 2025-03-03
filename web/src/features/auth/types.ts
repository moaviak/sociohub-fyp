export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username: string;
  loginType?: LOGIN_TYPES;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student extends User {
  registrationNumber?: string;
}

export interface Advisor extends User {
  societyName?: string;
}

export enum LOGIN_TYPES {
  EMAIL_PASSWORD = "EMAIL_PASSWORD",
  GOOGLE = "GOOGLE",
}

export type AuthResponse = {
  user: User;
  accessToken?: string;
};
