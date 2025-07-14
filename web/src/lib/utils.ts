import { PRIVILEGES } from "@/data";
import { Society } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert 24-hour format to 12-hour format
export const format24To12 = (time: string) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export function formatEventDateTime(
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string
): string {
  if (!startDate || !endDate || !startTime || !endTime) return "";

  const formattedStartTime = format24To12(startTime);
  const formattedEndTime = format24To12(endTime);

  // Check if it's a same-day event
  if (startDate === endDate) {
    return `${format(
      new Date(startDate),
      "EEE, MMM d"
    )} | ${formattedStartTime} - ${formattedEndTime}`;
  }

  // Multi-day event
  return `${format(
    new Date(startDate),
    "EEE, MMM d"
  )} | ${formattedStartTime} - ${format(
    new Date(endDate),
    "EEE, MMM d"
  )} | ${formattedEndTime}`;
}

/**
 * Determine the registration status. i.e. '"Not required" | "Registered" | "Registration Open" | "Registration Closed" | "Paid Event"'
 * @param isRegistrationRequired - boolean
 * @param registrationDeadline - Datetime string
 * @param isPaidEvent - boolean
 * @returns registration status string
 */
export function getRegistrationStatus(
  isRegistrationRequired: boolean,
  registrationDeadline?: string,
  isPaidEvent?: boolean,
  isRegistered?: boolean
) {
  if (!isRegistrationRequired) {
    return "Not required";
  }

  if (isRegistered) {
    return "Registered";
  }

  // If deadline is not provided, assume registration is open unless it's a paid event
  if (!registrationDeadline) {
    if (isPaidEvent) {
      return "Paid Event";
    }
    return "Registration Open";
  }

  const now = new Date();
  const deadline = new Date(registrationDeadline);

  if (now > deadline) {
    return "Registration Closed";
  }

  if (isPaidEvent) {
    return "Paid Event";
  }

  return "Registration Open";
}

export const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 4; // Get last 5 years including current year

  const years: string[] = [];
  for (let year = currentYear; year >= startYear; year--) {
    years.push(year.toString().slice(-2)); // Get last 2 digits
  }

  return years;
};

export const isEmail = (input: string): boolean => {
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
};

export const parseCredentials = (emailOrRegNo: string) => {
  const isEmailInput = isEmail(emailOrRegNo);
  const registrationNumberRegex = /^(SP|FA)\d{2}-[A-Z]{3}-\d{1,3}$/;

  return {
    email: isEmailInput ? emailOrRegNo : undefined,
    registrationNumber:
      !isEmailInput && registrationNumberRegex.test(emailOrRegNo)
        ? emailOrRegNo
        : undefined,
  };
};

export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export const formatCount = (count: number) => {
  if (count > 9) {
    return "9+";
  } else {
    return count;
  }
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
};

export const formatSocietyName = (societyName: string): string => {
  const prefix = "COMSATS ";
  if (societyName.startsWith(prefix)) {
    return societyName.slice(prefix.length);
  }
  return societyName;
};

export const haveMembersPrivilege = (
  societies: { society: Society & { privileges: string[] } }[],
  societyId: string
) => {
  const society = societies.find(({ society }) => society.id === societyId);

  return (
    society && society.society.privileges.includes(PRIVILEGES.MEMBER_MANAGEMENT)
  );
};

export const haveEventsPrivilege = (
  societies: { society: Society & { privileges: string[] } }[],
  societyId: string
) => {
  const society = societies.find(({ society }) => society.id === societyId);

  return (
    society && society.society.privileges.includes(PRIVILEGES.EVENT_MANAGEMENT)
  );
};

export const haveAnnouncementsPrivilege = (
  societies: { society: Society & { privileges: string[] } }[],
  societyId: string
) => {
  const society = societies.find(({ society }) => society.id === societyId);

  return (
    society &&
    society.society.privileges.includes(PRIVILEGES.ANNOUNCEMENT_MANAGEMENT)
  );
};

export const haveTasksPrivilege = (
  societies: { society: Society & { privileges: string[] } }[],
  societyId: string
) => {
  const society = societies.find(({ society }) => society.id === societyId);

  return (
    society && society.society.privileges.includes(PRIVILEGES.TASK_MANAGEMENT)
  );
};

export const haveSettingsPrivilege = (
  societies: { society: Society & { privileges: string[] } }[],
  societyId: string
) => {
  const society = societies.find(({ society }) => society.id === societyId);

  return (
    society &&
    society.society.privileges.includes(PRIVILEGES.SOCIETY_SETTINGS_MANAGEMENT)
  );
};

export const haveMeetingsPrivilege = (
  societies: { society: Society & { privileges: string[] } }[],
  societyId: string
) => {
  const society = societies.find(({ society }) => society.id === societyId);

  return (
    society &&
    society.society.privileges.includes(PRIVILEGES.MEETING_MANAGEMENT)
  );
};

export const havePaymentsPrivilege = (
  societies: { society: Society & { privileges: string[] } }[],
  societyId: string
) => {
  const society = societies.find(({ society }) => society.id === societyId);

  return (
    society &&
    society.society.privileges.includes(PRIVILEGES.PAYMENT_FINANCE_MANAGEMENT)
  );
};
