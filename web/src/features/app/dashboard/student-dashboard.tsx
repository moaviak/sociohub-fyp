import { TodoList } from "./components/todo-list";
import { RecentAnnouncements } from "./components/recent-announcements";
import { UpcomingEvents } from "./components/upcoming-events";

export const StudentDashboard = () => {
  return (
    <div className="w-full flex gap-4 py-4">
      <div className="flex-1 space-y-4">
        <UpcomingEvents />
        <div>{/* CALENDAR */}</div>
      </div>
      <div className="flex-1 space-y-4">
        <div>
          <TodoList />
        </div>
        <div>
          <RecentAnnouncements />
        </div>
      </div>
    </div>
  );
};
