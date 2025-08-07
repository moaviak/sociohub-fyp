import { Society } from "@/types/type";

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
