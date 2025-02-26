import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

import { useAppSelector } from "@/app/hooks";

function AppLayout() {
  const { isAuthenticated, isAuthChecked } = useAppSelector(
    (state) => state.auth
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthChecked && !isAuthenticated) {
      navigate("/sign-in");
    }
  }, [isAuthenticated, isAuthChecked, navigate]);

  if (!isAuthChecked) {
    // TODO: Add a App Skeleton
    return <div>Loading...</div>;
  }

  return <Outlet />;
}
export default AppLayout;
