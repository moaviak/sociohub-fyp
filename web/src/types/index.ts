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
  societies?: (Society & { privileges: string[] })[];
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
  acceptingNewMembers?: boolean;
  membersLimit?: number;
  createdAt: string;
  updatedAt: string;
  advisor?: Advisor;
  roles?: Role[];
  _count?: {
    members: number;
    joinRequests: number;
  };
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

export enum EventCategory {
  Workshop = "Workshop",
  Seminar = "Seminar",
  SocialGathering = "Social Gathering",
  Competition = "Competition",
  CulturalEvent = "Cultural Event",
  SportsEvent = "Sports Event",
  Meeting = "Meeting",
  Other = "Other",
}

export enum EventType {
  Physical = "Physical",
  Online = "Online",
}

export enum EventAudience {
  Open = "Open",
  Members = "Members",
  Invite = "Invite",
}

export enum EventVisibility {
  Publish = "Publish",
  Draft = "Draft",
  Schedule = "Schedule",
}

export enum PaymentMethods {
  CreditCard = "CreditCard",
  Easypaisa = "Easypaisa",
}

export enum EventStatus {
  Upcoming = "Upcoming",
  Ongoing = "Ongoing",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export interface Event {
  id: string;
  title: string;
  tagline?: string;
  description?: string;
  categories?: EventCategory[];
  banner?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  eventType?: EventType;
  venueName?: string;
  venueAddress?: string;
  platform?: string;
  meetingLink?: string;
  accessInstructions?: string;
  audience?: EventAudience;
  visibility?: EventVisibility;
  publishDateTime?: string;
  registrationRequired?: boolean;
  registrationDeadline?: string;
  maxParticipants?: number;
  paidEvent?: boolean;
  ticketPrice?: number;
  paymentMethods?: PaymentMethods[];
  announcementEnabled?: boolean;
  announcement?: string;
  status?: EventStatus;

  societyId?: string;

  formStep?: number;
  isDraft?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export * from "./event";
