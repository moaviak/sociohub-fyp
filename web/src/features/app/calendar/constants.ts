import { CalendarReminder } from "@/types";

interface TypeColors {
  bg: string;
  text: string;
  underline: string;
  dot: string;
  border: string;
}

export const typeColors: Record<CalendarReminder["type"], TypeColors> = {
  UPCOMING_EVENT: {
    bg: "bg-primary-100 border-primary-300",
    text: "text-primary-800",
    underline: "border-b-2 border-primary-500",
    dot: "bg-primary-500",
    border: "border-l-4 border-primary-500",
  },
  MEETING: {
    bg: "bg-secondary-100 border-secondary-300",
    text: "text-secondary-800",
    underline: "border-b-2 border-secondary-500",
    dot: "bg-secondary-500",
    border: "border-l-4 border-secondary-500",
  },
  PARTICIPANT_EVENT: {
    bg: "bg-accent-100 border-accent-300",
    text: "text-accent-800",
    underline: "border-b-2 border-accent-500",
    dot: "bg-accent-500",
    border: "border-l-4 border-accent-500",
  },
};

export const formatDateRange = (startDate: string, endDate: string): string => {
  const today = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  const isToday = (date: Date): boolean => {
    return date.toDateString() === today.toDateString();
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (start.toDateString() === end.toDateString()) {
    if (isToday(start)) {
      return `Today ${formatTime(start)}`;
    }
    return `${formatDate(start)} at ${formatTime(start)}`;
  }

  return `${start.getDate()}-${end.getDate()} ${start.toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  )} at ${formatTime(start)}`;
};
