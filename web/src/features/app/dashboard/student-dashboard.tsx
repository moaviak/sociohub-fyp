import { TodoList } from "./components/todo-list";
import { RecentAnnouncements } from "./components/recent-announcements";
import { UpcomingEvents } from "./components/upcoming-events";
import { CalendarView } from "./components/calendar-view";

export const StudentDashboard = () => {
  return (
    <div className="w-full flex gap-4 py-4">
      <div className="flex-1 space-y-4">
        <UpcomingEvents />
        <TodoList />
      </div>
      <div className="flex-1 space-y-4">
        <CalendarView />
        <RecentAnnouncements />
      </div>
    </div>
  );
};
