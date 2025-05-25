import { Navigate, Outlet, useLocation } from "react-router";

import { UserType } from "@/types";
import { useAppSelector } from "@/app/hooks";
import Explore from "@/features/app/explore";

function ExplorePage() {
  const { userType } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (userType && userType === UserType.ADVISOR) {
    return <Navigate to="/dashboard" />;
  }

  if (!(location.pathname === "/explore")) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col px-4 py-2">
      <h3 className="h3-semibold">
        Explore <span className="text-primary-600">SocioHub</span>
      </h3>
      <div className="flex-1 flex">
        <Explore />
      </div>
    </div>
  );
}
export default ExplorePage;
