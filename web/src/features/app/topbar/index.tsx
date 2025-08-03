import { Navigate } from "react-router";

import { useAppSelector } from "@/app/hooks";
import { UserAvatarMenu } from "@/components/user-avatar-menu";

import { Notifications } from "./components/notifications";
import { Search } from "./components/search";

const TopBar = () => {
  const { user, userType } = useAppSelector((state) => state.auth);

  if (!user || !userType) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <div className="w-full flex gap-x-6 py-2 px-6 items-center">
      <div className="flex-1 p-2">
        <Search />
      </div>
      <Notifications />
      <UserAvatarMenu user={user} userType={userType} />
    </div>
  );
};
export default TopBar;
