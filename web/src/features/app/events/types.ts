export interface EventAnnouncementInput {
  title: string;
  tagline?: string;
  description?: string;
  categories?: (
    | "Workshop"
    | "Seminar"
    | "Social Gathering"
    | "Competition"
    | "Cultural Event"
    | "Sports Event"
    | "Meeting"
    | "Other"
  )[];
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  eventType?: "Physical" | "Online";
  venueName?: string;
  venueAddress?: string;
  platform?: string;
  audience?: "Open" | "Members" | "Invite";
  registrationRequired?: boolean;
  registrationDeadline?: Date;
  maxParticipants?: number;
  paidEvent?: boolean;
  ticketPrice?: number;
}
