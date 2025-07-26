import { useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Teams } from "@/features/app/teams";
import { haveTeamsPrivilege } from "@/lib/utils";
import { Advisor } from "@/types";
import { Plus } from "lucide-react";
import { Link, Navigate, Outlet, useLocation, useParams } from "react-router";

const TeamsPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { societyId } = useParams();
  const location = useLocation();

  const isStudent = user && "registrationNumber" in user;

  if (isStudent && !societyId) {
    return <Navigate to="/dashboard" />;
  }

  const havePrivilege = isStudent
    ? haveTeamsPrivilege(user.societies || [], societyId || "")
    : !societyId || societyId === (user as Advisor).societyId;

  if (
    !(location.pathname === "/teams") &&
    !(location.pathname === `/teams/${societyId}`)
  ) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col px-4 py-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="h3-semibold">Society Teams</h3>
          <p className="b3-regular">
            An overview of all teams in your society.
          </p>
        </div>
        {havePrivilege && (
          <div className="space-x-4">
            <Button asChild>
              <Link to={`${location.pathname}/create-team`}>
                <Plus className="text-white w-4 h-4" />
                Create New Team
              </Link>
            </Button>
          </div>
        )}
      </div>
      <div className="flex-1 flex">
        <Teams societyId={societyId || (user as Advisor).societyId!} />
      </div>
    </div>
  );
};
export default TeamsPage;
