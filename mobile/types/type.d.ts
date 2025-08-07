import { Event } from ".";

declare type SocietyAdvisor = {
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  society: string;
};

declare interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified?: boolean;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

declare interface Student extends User {
  registrationNumber?: string;
  societies?: { society: Society & { privileges: string[] }; roles?: Role[] }[];
}

declare interface Advisor extends User {
  displayName?: string;
  phone?: string;
  societyId?: string;
  societyName?: string;
}

declare type AuthResponse = {
  user: Student | Advisor;
  userType: UserType;
  accessToken?: string;
  refreshToken?: string;
};

declare interface Society {
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

declare interface JoinRequest {
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

declare interface Member extends Student {
  roles?: Role[];
  societyId: string;
  interestedRole?: Role;
}

declare interface Role {
  id: string;
  name: string;
  description?: string;
  minSemester?: number;
  assignedMembers?: Member[];
  privileges?: string[];
  createdAt?: string;
  updatedAt?: string;
}

declare interface Registration {
  id: string;
  studentId: string;
  eventId: string;
  registeredAt?: string;
  ticket?: Ticket;
  student?: Student;
  event?: Event;
}

declare interface Ticket {
  id: string;
  registrationId?: string;
  qrCode?: string;
  issuedAt?: string;
  isScanned?: boolean;
  scannedAt?: string;
  scannedBy?: Student;
}
