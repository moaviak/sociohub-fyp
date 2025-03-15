import { useEffect } from "react";
import { Outlet } from "react-router";

import { useAppDispatch } from "@/app/hooks";
import { useGetUserQuery } from "@/features/auth/api";
import { setAuthChecked } from "@/features/auth/slice";

function MainLayout() {
  const dispatch = useAppDispatch();
  const { isLoading } = useGetUserQuery(null, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (!isLoading) {
      dispatch(setAuthChecked(true));
    }
  }, [isLoading, dispatch]);

  if (isLoading) {
    // TODO: Render the App Skeleton
    return <div>Loading...</div>;
  }

  return <Outlet />;
}
export default MainLayout;
