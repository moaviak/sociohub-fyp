import { EventCategory } from "@/types";

export const DEGREES = [
  { value: "BAF" },
  { value: "BAI" },
  { value: "BBA" },
  { value: "BCE" },
  { value: "BCS" },
  { value: "BEE" },
  { value: "BEN" },
  { value: "BSE" },
  { value: "BSM" },
  { value: "PCS" },
  { value: "PEE" },
  { value: "PMS" },
  { value: "PMT" },
  { value: "RCE" },
  { value: "RCS" },
  { value: "REE" },
  { value: "RMS" },
  { value: "RMT" },
  { value: "RPM" },
];

export const SOCIETIES_ADVISORS = [
  {
    displayName: "Dr. Syed Asim Shah",
    firstName: "Syed Asim",
    lastName: "Shah",
    email: "dr.asimshah@cuiatk.edu.pk",
    society: "Young Entrepreneurs Society (YES)",
  },
  {
    displayName: "Ms. Ameena",
    firstName: "Ameena",
    lastName: "Arshad",
    email: "ameena.arshad@cuiatk.edu.pk",
    society: "Environmental Protection Society (EPS)",
  },
  {
    displayName: "Yasir Muhammad",
    firstName: "Yasir",
    lastName: "Muhammad",
    email: "Yasir.ee@ciit-attock.edu.pk",
    society: "COMSATS Science Society (CSS)",
  },
  {
    displayName: "Ms. Sadia Ejaz",
    firstName: "Sadia",
    lastName: "Ejaz",
    email: "sadia@ciit-attock.edu.pk",
    society: "COMSATS Arts Society (CAS)",
  },
  {
    displayName: "Muhammad Qasim Khan",
    firstName: "Muhammad Qasim",
    lastName: "Khan",
    email: "qasimkhan@cuiatk.edu.pk",
    society: "COMSATS Freelancers Society (CFS)",
  },
  {
    displayName: "Dr. Muhammad Awais",
    firstName: "Awais",
    lastName: "Muhammad",
    email: "awais@ciit-attock.edu.pk",
    society: "COMSATS Health Awareness Society (CHAS)",
  },
  {
    displayName: "Ms. Tasneem Fiza",
    firstName: "Tasneem",
    lastName: "Fiza",
    email: "fizatasneem@cuiatk.edu.pk",
    society: "COMSATS Literary and Debating Society (CLDS)",
  },
  {
    displayName: "Dr. Adeel Saqib",
    firstName: "Adeel",
    lastName: "Saqib",
    email: "a.saqib@ciit-attock.edu.pk",
    society: "Attock Welfare Society (AWS)",
  },
  {
    displayName: "Dr. Atiq ur Rehman",
    firstName: "Atiq",
    lastName: "ur Rehman",
    email: "atiq@cuiatk.edu.pk",
    society: "CU Mathematical Society (CUMAS)",
  },
  {
    displayName: "Dr. Muhammad Bilal Khan",
    firstName: "Muhammad Bilal",
    lastName: "Khan",
    email: "engr_tanoli@ciit-attock.edu.pk",
    society: "COMSATS IEEE Student Society (CISS)",
  },
  {
    displayName: "Dr. Maimona Rafiq",
    firstName: "Maimona",
    lastName: "Rafiq",
    email: "maimona.rafiq@cuiatk.edu.pk",
    society: "COMSATS Dramatic Society (CDS)",
  },
  {
    displayName: "Armughan Ali",
    firstName: "Armughan",
    lastName: "Ali",
    email: "armughan_ali@cuiatk.edu.pk",
    society: "COMSATS Softech Society (CSS)",
  },
];

export const ROLES_PRIVILEGES = [
  {
    key: "event_management",
    title: "Event Management",
    description: "Can create, update, and delete events.",
  },
  {
    key: "member_management",
    title: "Member Management",
    description: "Can invite, approve, or remove members from the society.",
  },
  {
    key: "announcement_management",
    title: "Announcement Management",
    description: "Can create and publish announcements.",
  },
  {
    key: "content_management",
    title: "Content Management",
    description:
      "Can create, edit, and delete posts on the society's public page.",
  },
  {
    key: "event_ticket_handling",
    title: "Event Ticket Handling",
    description: "Can scan and validate tickets to manage event entry.",
  },
  {
    key: "payment_finance_management",
    title: "Payment and Finance Management",
    description:
      "Can manage society finances, event payments, withdrawals, and payment methods.",
  },
  {
    key: "society_settings_management",
    title: "Society Settings Management",
    description: "Can update society settings.",
  },
  {
    key: "task_management",
    title: "Task Management",
    description: "Can assign tasks to society members.",
  },
  {
    key: "meeting_management",
    title: "Meeting Management",
    description: "Can initiate and manage video meetings.",
  },
  {
    key: "teams_management",
    title: "Teams Management",
    description: "Can create and manage society teams.",
  },
];

export const PRIVILEGES = {
  EVENT_MANAGEMENT: "event_management",
  MEMBER_MANAGEMENT: "member_management",
  ANNOUNCEMENT_MANAGEMENT: "announcement_management",
  CONTENT_MANAGEMENT: "content_management",
  EVENT_TICKET_HANDLING: "event_ticket_handling",
  PAYMENT_FINANCE_MANAGEMENT: "payment_finance_management",
  SOCIETY_SETTINGS_MANAGEMENT: "society_settings_management",
  TASK_MANAGEMENT: "task_management",
  MEETING_MANAGEMENT: "meeting_management",
  TEAMS_MANAGEMENT: "teams_management",
};

export const REJECT_REASONS = [
  {
    title: "Does Not Meet Eligibility Criteria",
    description:
      "The applicant does not fulfill the required academic, semester, or department-based eligibility for joining the society.",
  },
  {
    title: "Incomplete or Inaccurate Application",
    description:
      "The join request lacks essential information or contains incorrect details that prevent proper evaluation.",
  },
  {
    title: "Quota or Membership Limit Reached",
    description:
      "The society has already reached its maximum allowed members and is currently not accepting new applications.",
  },
  {
    title: "Mismatch with Society Objectives",
    description:
      "The applicant’s interests or provided motivations do not align well with the goals or nature of the society.",
  },
  {
    title: "Violation of Previous Conduct Rules",
    description:
      "The applicant has a history of disciplinary issues or prior removal from the society or similar organizations.",
  },
];

export const REMOVAL_REASONS = [
  {
    title: "Lack of Participation",
    description:
      "The member consistently failed to attend meetings or participate in society activities despite multiple reminders.",
  },
  {
    title: "Violation of Society Rules",
    description:
      "The member breached society policies or engaged in conduct that goes against the values of the society.",
  },
  {
    title: "Misuse of Authority or Resources",
    description:
      "The member misused their role, access, or society resources, leading to loss of trust or integrity.",
  },
  {
    title: "Behavioral Misconduct",
    description:
      "The member displayed inappropriate behavior, harassment, or disrespect towards other members or organizers.",
  },
  {
    title: "Academic Ineligibility",
    description:
      "The member no longer meets the academic requirements for society membership (e.g., due to suspension or poor performance).",
  },
  {
    title: "Voluntary Withdrawal",
    description:
      "The member formally requested to leave the society or became inactive by choice.",
  },
];

export const EventCategories: EventCategory[] = [
  EventCategory.Workshop,
  EventCategory.Seminar,
  EventCategory.SocialGathering,
  EventCategory.Competition,
  EventCategory.CulturalEvent,
  EventCategory.SportsEvent,
  EventCategory.Meeting,
  EventCategory.Other,
];
