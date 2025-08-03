import { Calendar } from "./components/calendar";
import { ReminderCard } from "./components/reminder-card";
import { useGetCalendarRemindersQuery } from "../api";

export const CalendarView = () => {
  const { data: reminders } = useGetCalendarRemindersQuery();

  return (
    <div className="grid grid-cols-12 gap-4 w-full">
      <div className="col-span-4 max-h-screen overflow-hidden">
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-4 overflow-y-auto custom-scrollbar h-full min-h-0">
          <h3 className="b1-semibold text-neutral-900 mb-4">
            Upcoming Reminders
          </h3>
          {reminders?.map((reminder, idx) => (
            <ReminderCard key={idx} reminder={reminder} />
          ))}
          {(!reminders || reminders.length === 0) && (
            <div className="text-center text-neutral-500 py-8">
              <p className="b3-regular">No reminders found</p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-8">
        <Calendar reminders={reminders || []} />
      </div>
    </div>
  );
};
