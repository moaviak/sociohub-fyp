import { toast } from "sonner";
import { useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ApiError from "@/features/api-error";
import { Button } from "@/components/ui/button";
import { useLogoutMutation } from "@/features/auth/api";
import { Advisor, Student, UserType } from "@/types";
import { AvatarGroup } from "./avatar-group";

interface UserAvatarMenuProps {
  user: Student | Advisor;
  userType: UserType;
}

export const UserAvatarMenu = ({ user, userType }: UserAvatarMenuProps) => {
  const [logout, { isLoading, isError, error }] = useLogoutMutation();

  const handleLogout = async () => {
    const response = await logout();

    if (!("error" in response) && response.data) {
      toast.success("You have been logged out.");
    }
  };

  useEffect(() => {
    if (isError) {
      toast.error(
        (error as ApiError)?.errorMessage || "An unexpected error occurred",
        {
          duration: 10000,
        }
      );
    }
  }, [isError, error]);

  return (
    <div className="flex lg:gap-x-3 gap-x-1.5 items-center">
      <AvatarGroup
        user={user}
        userType={userType}
        className="lg:w-[180px] md:w-[120px] max-w-[180px] overflow-hidden"
        variant="top-bar"
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="group">
          <ChevronDown className="w-5 h-5 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180 group-data-[state=closed]:rotate-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={10}>
          <DropdownMenuLabel>
            <Link to={`/profile/${user.id}`}>Profile</Link>
          </DropdownMenuLabel>
          <DropdownMenuLabel>
            <Link to="/dashboard">Dashboard</Link>
          </DropdownMenuLabel>
          {userType === UserType.STUDENT && (
            <DropdownMenuLabel>
              <Link to="/my-events">My Events</Link>
            </DropdownMenuLabel>
          )}
          <DropdownMenuLabel>
            <Link to="/user-settings">Settings</Link>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-neutral-300" />
          <DropdownMenuLabel>
            <Button
              variant="ghost"
              size="inline"
              className="text-red-600"
              onClick={handleLogout}
              disabled={isLoading}
            >
              Logout
            </Button>
          </DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
