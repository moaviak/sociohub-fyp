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
    <div className="flex w-full max-h-screen overflow-y-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 mx-6 my-2 max-h-full overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  ) : null;
}
export default AppLayout;
