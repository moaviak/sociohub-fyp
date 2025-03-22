import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

import { useAppSelector } from "@/app/hooks";
import Sidebar from "@/features/app/sidebar";
import { Advisor, Student, UserType } from "@/types";

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
      } else if (
        userType === UserType.STUDENT &&
        !(user as Student).registrationNumber
      ) {
        navigate("/sign-up/student/reg-no", { replace: true });
      }
      // If all conditions are met, user stays on the current route (dashboard)
    }
  }, [isAuthenticated, isAuthChecked, navigate, user, userType]);

  if (!isAuthChecked) {
    // TODO: Add a App Skeleton
    return <div>Loading...</div>;
  }

  // Only render the outlet if user is authenticated
  return isAuthenticated ? (
    <div className="flex w-full">
      <Sidebar />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  ) : null;
}
export default AppLayout;
