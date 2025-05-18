import { Link, Navigate, Outlet, useLocation, useParams } from "react-router";

import { useAppSelector } from "@/app/hooks";
import { haveEventsPrivilege } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Events } from "@/features/app/events";

const EventsPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { societyId } = useParams();
  const location = useLocation();

  const isStudent = user && "registrationNumber" in user;

  if (isStudent && !societyId) {
    return <Navigate to="/dashboard" />;
  }

  const havePrivilege = isStudent
    ? haveEventsPrivilege(user.societies || [], societyId || "")
    : true;

  if (
    !(location.pathname === "/events") &&
    !(location.pathname === `/events/${societyId}`)
  ) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col px-4 py-2 max-h-full overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="h3-semibold">Events</h3>
          <p className="b3-regular">
            Discover, participate in, and manage all society activities.
          </p>
        </div>
        {havePrivilege && (
          <div className="space-x-4">
            <Button asChild>
              <Link
                to={`/events/${
                  societyId ? `${societyId}/create-event` : "create-event"
                }`}
              >
                <Plus className="text-white w-4 h-4" />
                Create new event
              </Link>
            </Button>
          </div>
        )}
      </div>
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <Events />
      </div>
    </div>
  );
};
export default EventsPage;
