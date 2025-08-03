import { useEffect } from "react";
import { Outlet } from "react-router";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useGetUserQuery } from "@/features/auth/api";
import { setAuthChecked } from "@/features/auth/slice";
import { useRefreshAuthMutation } from "@/features/api";
import { SpinnerLoader } from "@/components/spinner-loader";

function MainLayout() {
  const dispatch = useAppDispatch();
  const { accessToken, refreshToken } = useAppSelector((state) => state.auth);

  const [refreshAuth, { isLoading: isRefreshing }] = useRefreshAuthMutation();
  const { isLoading, refetch } = useGetUserQuery(null, {
    // Only refetch on mount if we already have tokens
    skip: !accessToken && !refreshToken && !isRefreshing,
    refetchOnMountOrArgChange: true,
  });

  // Try to refresh token if we have a refresh token but no access token
  useEffect(() => {
    const attemptTokenRefresh = async () => {
      // Only try to refresh if we have a refresh token but no access token
      if (!accessToken && refreshToken) {
        const refreshed = await refreshAuth();

        if (refreshed) {
          // If refresh successful, trigger the user query
          refetch();
        }
      }
    };

    attemptTokenRefresh();
  }, [accessToken, refreshToken, refetch, refreshAuth]);

  useEffect(() => {
    if (!isLoading && !isRefreshing) {
      dispatch(setAuthChecked(true));
    }
  }, [isLoading, isRefreshing, dispatch]);

  if (isLoading || isRefreshing) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <SpinnerLoader size="lg" />
      </div>
    );
  }

  return <Outlet />;
}
export default MainLayout;
