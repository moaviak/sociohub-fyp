import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import { RootState } from "@/app/store";
import { useAppSelector } from "@/app/hooks";

import { Header } from "./components/header";

function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);

  const isVerifyEmail = location.pathname === "/sign-up/verify-email";
  const isStudentRegNo = location.pathname === "/sign-up/student/reg-no";
  const isSocietyForm = location.pathname === "/sign-up/society-form";

  useEffect(() => {
    if (
      isAuthenticated &&
      !isVerifyEmail &&
      !isStudentRegNo &&
      !isSocietyForm
    ) {
      navigate("/dashboard", { replace: true });
    } else if (
      !isAuthenticated &&
      (isVerifyEmail || isStudentRegNo || isSocietyForm)
    ) {
      navigate("/sign-in", { replace: true });
    }
  }, [isAuthenticated, isVerifyEmail, isStudentRegNo, isSocietyForm, navigate]);

  return (
    <div className="flex flex-col relative overflow-hidden min-h-screen">
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
