export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified?: boolean;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student extends User {
  registrationNumber?: string;
}

export interface Advisor extends User {
  displayName?: string;
  phone?: string;
  societyId?: string;
  societyName?: string;
}

export enum UserType {
  STUDENT = "student",
  ADVISOR = "advisor",
}

export interface Society {
  id: string;
  name: string;
  description: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
  advisor?: Advisor;
  _count?: {
    members: number;
    joinRequests: number;
  };
}

export interface JoinRequest {
  studentId: string;
  societyId: string;
  student: Student;
  reason: string;
  expectations: string;
  skills?: string;
  createdAt: string;
  updatedAt: string;
}

export enum RequestAction {
  ACCEPT = "accept",
  REJECT = "reject",
}
