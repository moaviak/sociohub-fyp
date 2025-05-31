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
          <RecentAnnouncements />
        </div>
        <div>{/* TODO LIST */}</div>
      </div>
    </div>
  );
};
