import { CalendarView } from "@/features/app/calendar";

const CalendarPage = () => {
  return (
    <div className="flex flex-col px-4 py-2 gap-y-4">
      <div>
        <h3 className="h3-semibold">Calendar</h3>
        <p className="b3-regular">See your upcoming events and meetings</p>
      </div>
      <div className="flex-1 flex">
        <CalendarView />
      </div>
    </div>
  );
};
export default CalendarPage;
