import { Logo } from "@/components/logo";
import { useAppSelector } from "@/app/hooks";
import { Navigate } from "react-router";
import { UserType } from "@/types";

import { AdvisorSidebar } from "./advisor-sidebar";
import { StudentSidebar } from "./student-sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useSidebar } from "@/providers/sidebar-provider";

const Sidebar = () => {
  const { userType } = useAppSelector((state) => state.auth);
  const { isOpen, setIsOpen, closeSidebar } = useSidebar();

  if (!userType) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="col-span-2 hidden md:flex flex-col max-h-screen items-center overflow-y-scroll overflow-x-hidden custom-scrollbar py-6 gap-y-4">
        <Logo />
        {userType === UserType.ADVISOR ? (
          <AdvisorSidebar />
        ) : (
          <StudentSidebar />
        )}
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="p-2 pt-10">
          <div className="flex flex-col items-center gap-y-4">
            <Logo />
            {userType === UserType.ADVISOR ? (
              <AdvisorSidebar onItemClick={closeSidebar} />
            ) : (
              <StudentSidebar onItemClick={closeSidebar} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;
