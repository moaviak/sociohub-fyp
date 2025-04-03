import { Link, Navigate, Outlet, useLocation, useParams } from "react-router";

import { UserType } from "@/types";
import { useAppSelector } from "@/app/hooks";
import Members from "@/features/app/members";
import { Button } from "@/components/ui/button";

function MembersPage() {
  const { userType } = useAppSelector((state) => state.auth);
  const { societyId } = useParams();
  const location = useLocation();

  if (userType && userType === UserType.STUDENT && !societyId) {
    return <Navigate to="/dashboard" />;
  }

  if (
    !(location.pathname === "/members") &&
    !(location.pathname === `/members/${societyId}`)
  ) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col px-4 py-2 max-h-full overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="h3-semibold">Members Management</h3>
          <p className="b3-regular">
            Manage Members and Assign Roles to Streamline Society Operations.
          </p>
        </div>
        <div className="space-x-4">
          <Button asChild>
            <Link to="/members/roles">Manage Roles</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/members/requests">View Join Requests</Link>
          </Button>
        </div>
      </div>
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <Members />
      </div>
    </div>
  );
}
export default MembersPage;
