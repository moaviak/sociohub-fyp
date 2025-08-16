import { DevicePlatform } from "@/features/notifications/api";

export type SocietyAdvisor = {
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  society: string;
};

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified?: boolean;
  avatar?: string;
  bio?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student extends User {
  registrationNumber?: string;
  societies?: { society: Society & { privileges: string[] }; roles?: Role[] }[];
  _count?: {
    eventRegistrations: number;
  };
}

export interface Advisor extends User {
  displayName?: string;
  societyId?: string;
  societyName?: string;
  society?: Society;
}
export interface Society {
  id: string;
  name: string;
  description: string;
  statementOfPurpose?: string;
  advisorMessage?: string;
  coreValues?: string;
  mission?: string;
  logo?: string;
  acceptingNewMembers?: boolean;
  membersLimit?: number;
  createdAt: string;
  updatedAt: string;
  advisorId?: string;
  advisor?: Advisor;
  roles?: Role[];
  _count?: {
    members: number;
    events?: number;
    joinRequests?: number;
  };
  officeBearers?: { role: string; student: Student }[];
  isMember?: boolean;
  hasRequestedToJoin?: boolean;
}

export type AuthResponse = {
  user: Student | Advisor;
  userType: UserType;
  accessToken?: string;
  refreshToken?: string;
};

export interface Society {
  id: string;
  name: string;
  description: string;
  statementOfPurpose?: string;
  advisorMessage?: string;
  coreValues?: string;
  mission?: string;
  logo?: string;
  acceptingNewMembers?: boolean;
  membersLimit?: number;
  createdAt: string;
  updatedAt: string;
  advisorId?: string;
  advisor?: Advisor;
  roles?: Role[];
  _count?: {
    members: number;
    events?: number;
    joinRequests?: number;
  };
  officeBearers?: { role: string; student: Student }[];
  isMember?: boolean;
  hasRequestedToJoin?: boolean;
}
`q765`;

export interface JoinRequest {
  id: string;
  studentId: string;
  societyId: string;
  student: Student;
  whatsappNo: string;
  semester: number;
  interestedRole?: Role;
  pdf?: string;
  status: JoinRequestStatus;
  rejectionReason?: string;
  reason: string;
  expectations: string;
  skills?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Member extends Student {
  roles?: Role[];
  societyId: string;
  interestedRole?: Role;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  minSemester?: number;
  assignedMembers?: Member[];
  privileges?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Ticket {
  id: string;
  registrationId?: string;
  qrCode?: string;
  issuedAt?: string;
  isScanned?: boolean;
  scannedAt?: string;
  scannedBy?: Student;
}

export enum UserType {
  ADVISOR = "advisor",
  STUDENT = "student",
}

export enum JoinRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum RequestAction {
  ACCEPT = "accept",
  REJECT = "reject",
}

export interface Notification {
  id: string;
  title: string;
  description?: string;
  image?: string;
  webRedirectUrl?: string;
  mobileRedirectUrl?: {
    pathname: string;
    params: any;
  };
  isRead: boolean;
  isDeleted: boolean;
  readAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PushToken {
  id: string;
  token: string;
  meta?: any;
  createdAt: Date;
  updatedAt: Date;
  deviceId?: string;
  platform?: DevicePlatform;
  studentId?: string;
  advisorId?: string;
  isActive: boolean;
  lastUsedAt?: Date;
}
