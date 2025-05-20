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
  societies?: (Society & { privileges: string[] })[];
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
