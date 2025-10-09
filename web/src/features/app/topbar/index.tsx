import { Navigate } from "react-router";
import { MenuIcon } from "lucide-react";

import { useAppSelector } from "@/app/hooks";
import { UserAvatarMenu } from "@/components/user-avatar-menu";
import { Button } from "@/components/ui/button";

import { Notifications } from "./components/notifications";
import { Search } from "./components/search";
import { useSidebar } from "@/providers/sidebar-provider";

const TopBar = () => {
  const { user, userType } = useAppSelector((state) => state.auth);
  const { openSidebar } = useSidebar();

  if (!user || !userType) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <div className="w-full flex lg:gap-x-6 gap-x-4 py-2 px-4 lg:px-6 items-center">
      {/* Mobile Menu Button */}
      <Button
        onClick={openSidebar}
        className="block md:hidden"
        variant="ghost"
        size="sm"
      >
        <MenuIcon className="h-4 w-4" />
      </Button>

      <div className="flex-1 p-2">
        <Search />
      </div>
      <Notifications />
      <UserAvatarMenu user={user} userType={userType} />
    </div>
  );
};

export default TopBar;
