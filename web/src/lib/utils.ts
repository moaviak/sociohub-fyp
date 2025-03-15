import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 5; // Get last 6 years including current year

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
