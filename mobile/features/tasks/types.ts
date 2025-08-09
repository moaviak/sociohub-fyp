import { Society } from "@/types";

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
