import { useEffect } from "react";
import { Outlet } from "react-router";

import { useAppDispatch } from "@/app/hooks";
import { useGetUserQuery } from "@/features/auth/api";
import { setAuthChecked } from "@/features/auth/slice";
import { AppSkeleton } from "@/components/skeleton/app-skeleton";

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
    return <AppSkeleton />;
  }

  return <Outlet />;
}
export default MainLayout;
