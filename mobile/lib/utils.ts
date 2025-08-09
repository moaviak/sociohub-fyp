import { Society } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export const checkPrivilege = (
  societies: { society: Society & { privileges: string[] } }[],
  societyId: string,
  privilege: string
) => {
  const society = societies.find(({ society }) => society.id === societyId);

  return society && society.society.privileges.includes(privilege);
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

export const format24To12 = (time: string) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

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
