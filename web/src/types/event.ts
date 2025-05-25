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
