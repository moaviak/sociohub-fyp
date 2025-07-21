import { Advisor, Student } from "@/types";

export interface Participant {
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
  participants: Participant[];
  messages: Message[];
  adminId?: string;
  admin?: Participant;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  chatId: string;
  sender: Participant;
  senderId: string;
  attachments?: Attachment[];
  readBy: Participant[];
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
