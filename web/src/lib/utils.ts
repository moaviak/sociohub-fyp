import { PRIVILEGES } from "@/data";
import { Society } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
  societies: (Society & { privileges: string[] })[],
  societyId: string
) => {
  const society = societies.find((society) => society.id === societyId);

  return society && society.privileges.includes(PRIVILEGES.MEMBER_MANAGEMENT);
};

export const haveEventsPrivilege = (
  societies: (Society & { privileges: string[] })[],
  societyId: string
) => {
  const society = societies.find((society) => society.id === societyId);

  return society && society.privileges.includes(PRIVILEGES.EVENT_MANAGEMENT);
};
