import { useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Announcements } from "@/features/app/announcements";
import { haveAnnouncementsPrivilege } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Link, Navigate, Outlet, useLocation, useParams } from "react-router";

const AnnouncementsPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { societyId } = useParams();
  const location = useLocation();

  const isStudent = user && "registrationNumber" in user;

  if (isStudent && !societyId) {
    return <Navigate to="/dashboard" />;
  }

  const havePrivilege = isStudent
    ? haveAnnouncementsPrivilege(user.societies || [], societyId || "")
    : true;

  if (
    !(location.pathname === "/announcements") &&
    !(location.pathname === `/announcements/${societyId}`)
  ) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col px-4 py-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="h3-semibold">Announcements</h3>
          <p className="b3-regular">
            Create and manage important updates for your society members.
          </p>
        </div>
        {havePrivilege && (
          <div className="space-x-4">
            <Button asChild>
              <Link to={`${location.pathname}/create-announcement`}>
                <Plus className="text-white w-4 h-4" />
                Create new announcement
              </Link>
            </Button>
          </div>
        )}
      </div>
      <div className="flex-1 flex">
        <Announcements />
      </div>
    </div>
  );
};
export default AnnouncementsPage;
