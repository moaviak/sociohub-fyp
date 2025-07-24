import { Advisor, Student } from "@/types";

export interface IUser {
  id: string;
  studentId?: string;
  advisorId?: string;
  isOnline: boolean;
  lastSeen: string;
  student?: Student;
  advisor?: Advisor;
}

export interface Chat {
  id: string;
  name?: string;
  type: "ONE_ON_ONE" | "GROUP";
  societyId?: string;
  chatImage?: string;
  participants: IUser[];
  messages: Message[];
  adminId?: string;
  admin?: IUser;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  chatId: string;
  sender: IUser;
  senderId: string;
  attachments?: Attachment[];
  readBy: IUser[];
  isSending?: boolean;
  isError?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT";
  name?: string;
  size?: number;
  createdAt: string;
  updatedAt: string;
}
