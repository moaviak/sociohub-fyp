import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

import { RootState } from "@/app/store";
import { useAppSelector } from "@/app/hooks";

import { Header } from "./components/header";

function AuthLayout() {
  const navigate = useNavigate();

  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex flex-col relative overflow-hidden">
      <Header />
      <img
        src="/assets/images/Background.png"
        alt=""
        className="absolute top-0 left-0 bg-contain -z-10"
      />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
export default AuthLayout;
