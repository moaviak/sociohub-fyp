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
}

export interface Advisor extends User {
  displayName?: string;
  societyId?: string;
  societyName?: string;
  society?: Society;
}

export enum UserType {
  STUDENT = "student",
  ADVISOR = "advisor",
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

export enum JoinRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

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

export enum RequestAction {
  ACCEPT = "accept",
  REJECT = "reject",
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

export interface Notification {
  id: string;
  title: string;
  description?: string;
  image?: string;
  webRedirectUrl?: string;
  mobileRedirectUrl?: string;
  isRead: boolean;
  isDeleted: boolean;
  readAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export * from "./event";

export * from "./announcement";

export interface Task {
  id: string;
  description: string;
  isCompleted: boolean;
  isStarred: boolean;
  assignedBySocietyId?: string;
  assignedBySociety?: Society;

  createdAt?: string;
  updatedAt?: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  dailyRoomUrl?: string;
  dailyRoomName?: string;
  dailyRoomConfig?: unknown;
  meetingCode: string;
  scheduledAt: string;
  hostSocietyId: string;
  hostSociety: Society;
  hostAdvisorId?: string;
  hostAdvisor?: Advisor;
  hostStudentId?: string;
  hostStudent?: Student;
  audienceType: MeetingAudienceType;
  status: MeetingStatus;
  startedAt?: string;
  endedAt?: string;
  invitedUserIds: string[];
  invitedUsers: User[];
  createdAt: string;
  updatedAt: string;
}

export enum MeetingAudienceType {
  ALL_SOCIETY_MEMBERS = "ALL_SOCIETY_MEMBERS",
  SPECIFIC_MEMBERS = "SPECIFIC_MEMBERS",
}

export enum MeetingStatus {
  SCHEDULED = "SCHEDULED",
  LIVE = "LIVE",
  ENDED = "ENDED",
  CANCELLED = "CANCELLED",
}
