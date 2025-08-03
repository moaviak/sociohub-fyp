import { useGetCalendarRemindersQuery } from "../../api";
import { Calendar } from "../../calendar/components/calendar";

export const CalendarView = () => {
  const { data: reminders } = useGetCalendarRemindersQuery();

  return <Calendar reminders={reminders || []} variant="mini" />;
};
