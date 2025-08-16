import { Society } from "@/types";

export enum AnnouncementAudience {
  ALL = "All",
  MEMBERS = "Members",
}

export enum AnnouncementStatus {
  PUBLISH = "Publish",
  SCHEDULE = "Schedule",
}

export interface Announcement {
  id: string;
  title: string;
  content?: string;
  publishDateTime?: string;
  status?: AnnouncementStatus;
  audience?: AnnouncementAudience;
  sendEmail?: boolean;
  societyId?: string;

  society?: Society;

  createdAt?: string;
  updatedAt?: string;
}
