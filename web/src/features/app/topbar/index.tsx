import { Navigate } from "react-router";

import { useAppSelector } from "@/app/hooks";
import { AvatarGroup } from "@/components/avatar-group";

import { SearchBar } from "./components/search-bar";
import { Notifications } from "./components/notifications";

const TopBar = () => {
  const { user, userType } = useAppSelector((state) => state.auth);

  if (!user || !userType) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <div className="w-full flex gap-x-6 py-2 px-6 items-center">
      <div className="flex-1 p-2">
        <SearchBar />
      </div>
      <Notifications />
      <AvatarGroup user={user} userType={userType} />
    </div>
  );
};
export default TopBar;
