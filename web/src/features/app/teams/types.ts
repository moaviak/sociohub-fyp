import { Student } from "@/types";

export interface Team {
  id: string;
  name: string;
  description: string | null;
  logo?: string;
  societyId: string;
  leadId: string;
  lead: Student;
  _count: {
    members: number;
    joinRequests?: number;
  };
  members: TeamMember[];
  teamTasks?: TeamTask[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  studentId: string;
  student: Student;
  joinedAt: string;
}

export interface TeamJoinRequest {
  id: string;
  teamId: string;
  studentId: string;
  message?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  student: Student;
}

export interface TeamTask {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  status: "TO_DO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  assignedById?: string;
  assignedByAdvisorId?: string;
  assignedBy?: Student;
  createdAt: string;
  updatedAt: string;
}
