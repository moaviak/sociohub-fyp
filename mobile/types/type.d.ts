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
};

declare interface Society {
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
