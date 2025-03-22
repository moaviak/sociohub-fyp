import { Logo } from "@/components/logo";
import { useAppSelector } from "@/app/hooks";
import { Navigate } from "react-router";
import { UserType } from "@/types";

import { AdvisorSidebar } from "./advisor-sidebar";
import { StudentSidebar } from "./student-sidebar";

const Sidebar = () => {
  const { userType } = useAppSelector((state) => state.auth);

  if (!userType) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <div className="flex flex-col max-h-screen items-center overflow-y-scroll overflow-x-hidden custom-scrollbar py-6 gap-y-4">
      <Logo />
      {userType === UserType.ADVISOR ? <AdvisorSidebar /> : <StudentSidebar />}
    </div>
  );
};
export default Sidebar;
