import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import { Advisor, UserType } from "@/types";
import { useAppSelector } from "@/app/hooks";
import { AppSkeleton } from "@/components/skeleton/app-skeleton";

import { Header } from "./components/header";

function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, isAuthChecked, user, userType } = useAppSelector(
    (state) => state.auth
  );

  const isVerifyEmail = location.pathname === "/sign-up/verify-email";
  const isSocietyForm = location.pathname === "/sign-up/society-form";
  const isSignIn = location.pathname === "/sign-in";
  const isSignUp =
    location.pathname.startsWith("/sign-up") &&
    !isVerifyEmail &&
    !isSocietyForm;

  useEffect(() => {
    
    if (!isAuthChecked) {
      // Still loading, don't redirect yet
      return;
    }

    // Handle special auth routes that require authentication
    if ((isVerifyEmail || isSocietyForm) && !isAuthenticated) {
      navigate("/sign-in", { replace: true });
      return;
    }

    // If user is fully authenticated and on a public route, redirect to dashboard
    if (isAuthenticated && (isSignIn || isSignUp)) {
      // Check if user has completed all required steps
      if (user && user.isEmailVerified) {
        if (userType === UserType.ADVISOR && !(user as Advisor).societyId) {
          navigate("/sign-up/society-form", { replace: true });
        } else {
          // All steps completed, go to dashboard
          navigate("/dashboard", { replace: true });
        }
      } else if (user && !user.isEmailVerified) {
        navigate("/sign-up/verify-email", { replace: true });
      }
    }

    // Additional check for the verify email and society form routes
    if (isAuthenticated && user) {
      // If email is verified and on verify email page, redirect to appropriate next step
      if (isVerifyEmail && user.isEmailVerified) {
        if (userType === UserType.ADVISOR && !(user as Advisor).societyId) {
          navigate("/sign-up/society-form", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }

      // If society is created and on society form page, redirect to dashboard
      if (
        isSocietyForm &&
        userType === UserType.ADVISOR &&
        (user as Advisor).societyId
      ) {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [
    isAuthenticated,
    isAuthChecked,
    isVerifyEmail,
    isSocietyForm,
    isSignIn,
    isSignUp,
    navigate,
    user,
    userType,
  ]);

  if (!isAuthChecked && (isVerifyEmail || isSocietyForm)) {
    return <AppSkeleton />;
  }

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
