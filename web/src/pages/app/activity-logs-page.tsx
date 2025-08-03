import { useAppSelector } from "@/app/hooks";
import { ActivityLogs } from "@/features/app/society/activity-logs";
import { Navigate } from "react-router";

const ActivityLogsPage = () => {
  const user = useAppSelector((state) => state.auth.user);

  if (!user || !("societyId" in user) || !user.societyId) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex flex-col px-4 py-2 ">
      <div>
        <h3 className="h3-semibold">Activity Logs</h3>
        <p className="b3-regular">
          Get a comprehensive view of all society activities performed by
          members.
        </p>
      </div>
      <div className="flex-1 flex">
        <ActivityLogs societyId={user.societyId} />
      </div>
    </div>
  );
};
export default ActivityLogsPage;
