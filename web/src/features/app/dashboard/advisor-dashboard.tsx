import { useAppSelector } from "@/app/hooks";
import { SocietyKPIs } from "./components/society-kpis";
import { UpcomingEvents } from "./components/upcoming-events";
import { TodoList } from "./components/todo-list";
import { ActivityLogs } from "./components/activity-logs";
import { CalendarView } from "./components/calendar-view";

export const AdvisorDashboard = () => {
  const user = useAppSelector((state) => state.auth.user);

  if (!user || !("societyId" in user) || !user.societyId) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 py-4 w-full">
      <SocietyKPIs societyId={user.societyId} />
      <div className="flex gap-4">
        <div className="flex-1 space-y-4">
          <TodoList />
          <ActivityLogs societyId={user.societyId} />
        </div>
        <div className="flex-1 space-y-4">
          <CalendarView />
          <UpcomingEvents societyId={user.societyId} />
        </div>
      </div>
    </div>
  );
};
