import { Outlet } from "react-router";

import { RootState } from "@/app/store";
import { useAppSelector } from "@/app/hooks";

import { useGetUserQuery } from "../features/auth/api";

function MainLayout() {
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);

  useGetUserQuery(null, {
    skip: isAuthenticated,
  });

  return <Outlet />;
}
export default MainLayout;
