import { Navigate } from "react-router";

import { UserType } from "@/types";
import { useAppSelector } from "@/app/hooks";
import Explore from "@/features/app/explore";

function ExplorePage() {
  const { userType } = useAppSelector((state) => state.auth);

  if (userType && userType === UserType.ADVISOR) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex flex-col px-4 py-2 max-h-full overflow-hidden">
      <h3 className="h3-semibold">
        Explore <span className="text-primary-600">SocioHub</span>
      </h3>
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <Explore />
      </div>
    </div>
  );
}
export default ExplorePage;
