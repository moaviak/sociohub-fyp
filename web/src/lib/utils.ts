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

export const parseCredentials = (emailOrUsername: string) => {
  const isEmailInput = isEmail(emailOrUsername);
  return {
    email: isEmailInput ? emailOrUsername : undefined,
    username: !isEmailInput ? emailOrUsername : undefined,
  };
};
