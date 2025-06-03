import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

import TopBar from "@/features/app/topbar";
import Sidebar from "@/features/app/sidebar";
import { useAppSelector } from "@/app/hooks";
import { Advisor, UserType } from "@/types";
import { AppSkeleton } from "@/components/skeleton/app-skeleton";

function AppLayout() {
  const { isAuthenticated, isAuthChecked, user, userType } = useAppSelector(
    (state) => state.auth
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthChecked) {
      // Still loading, don't redirect yet
      return;
    }

    if (!isAuthenticated) {
      // Not authenticated, redirect to sign-in
      navigate("/sign-in", { replace: true });
      return;
    }

    // User is authenticated, check for completion steps
    if (user) {
      if (!user.isEmailVerified) {
        navigate("/sign-up/verify-email", { replace: true });
      } else if (
        userType === UserType.ADVISOR &&
        !(user as Advisor).societyId
      ) {
        navigate("/sign-up/society-form", { replace: true });
      }
      // If all conditions are met, user stays on the current route (dashboard)
    }
  }, [isAuthenticated, isAuthChecked, navigate, user, userType]);

  if (!isAuthChecked) {
    return <AppSkeleton />;
  }

  // Only render the outlet if user is authenticated
  return isAuthenticated ? (
    <div className="grid grid-cols-12 w-full h-screen max-h-screen overflow-y-hidden">
      <Sidebar />
      <div className="col-span-10 flex flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 px-6 py-2 max-h-full overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  ) : null;
}
export default AppLayout;
