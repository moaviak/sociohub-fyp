import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

import { useAppSelector } from "@/app/hooks";
import { Advisor, Student, UserType } from "@/features/auth/types";

function AppLayout() {
  const { isAuthenticated, isAuthChecked, user, userType } = useAppSelector(
    (state) => state.auth
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthChecked && !isAuthenticated) {
      navigate("/sign-in");
    }
  }, [isAuthenticated, isAuthChecked, navigate]);

  useEffect(() => {
    if (userType === UserType.ADVISOR && !(user as Advisor).societyId) {
      navigate("/sign-up/society-form");
    } else if (
      userType === UserType.STUDENT &&
      !(user as Student).registrationNumber
    ) {
      navigate("/sign-up/student/reg-no");
    }
  }, [navigate, user, userType]);

  if (!isAuthChecked) {
    // TODO: Add a App Skeleton
    return <div>Loading...</div>;
  }

  return <Outlet />;
}
export default AppLayout;
