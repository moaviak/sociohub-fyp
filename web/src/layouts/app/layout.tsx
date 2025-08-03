import { useCallback, useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

import TopBar from "@/features/app/topbar";
import Sidebar from "@/features/app/sidebar";
import { useAppSelector } from "@/app/hooks";
import { Advisor, UserType } from "@/types";
import { ChatBot } from "@/features/app/chat-bot";
import { useCreateSessionMutation } from "@/features/app/chat-bot/api";
import { SpinnerLoader } from "@/components/spinner-loader";

function AppLayout() {
  const { isAuthenticated, isAuthChecked, user, userType } = useAppSelector(
    (state) => state.auth
  );
  const { sessionId, isLoading } = useAppSelector((state) => state.chatBot);
  const [createSession] = useCreateSessionMutation();

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
      }
      // If all conditions are met, user stays on the current route (dashboard)
    }
  }, [isAuthenticated, isAuthChecked, navigate, user, userType]);

  const initializeSession = useCallback(async () => {
    try {
      await createSession().unwrap();
    } catch (error) {
      console.error("Failed to create chatbot session:", error);
    }
  }, [createSession]);

  useEffect(() => {
    if (!sessionId && !isLoading) {
      initializeSession();
    }
  }, [sessionId, initializeSession, isLoading]);

  if (!isAuthChecked) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <SpinnerLoader size="lg" />
      </div>
    );
  }

  // Only render the outlet if user is authenticated
  return isAuthenticated ? (
    <div className="grid grid-cols-12 w-full h-screen max-h-screen overflow-y-hidden">
      <Sidebar />
      <div className="col-span-10 flex flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 px-6 py-2 max-h-full overflow-y-auto">
          <Outlet />
        </div>
      </div>
      <ChatBot />
    </div>
  ) : null;
}
export default AppLayout;
