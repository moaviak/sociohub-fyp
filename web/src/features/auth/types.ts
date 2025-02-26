export type User = Student | Advisor;

export type Student = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username: string;
  registrationNumber?: string;
  loginType?: LOGIN_TYPES;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Advisor = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username: string;
  loginType?: LOGIN_TYPES;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export enum LOGIN_TYPES {
  EMAIL_PASSWORD = "EMAIL_PASSWORD",
  GOOGLE = "GOOGLE",
}

export type AuthResponse = {
  user: User;
  accessToken: string;
};
