import { toast } from "sonner";
import { useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router";

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
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Advisor, Student, UserType } from "@/features/auth/types";

interface AvatarGroupProps {
  user: Student | Advisor;
  userType: UserType;
}

export const AvatarGroup = ({ user, userType }: AvatarGroupProps) => {
  const navigate = useNavigate();
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
    <div className="flex gap-x-3 items-center">
      <Avatar
        onClick={() => navigate(`/profile/${user.id}`)}
        className="h-10 w-10 cursor-pointer"
      >
        <AvatarImage
          src={user.avatar ?? "/assets/images/avatar-placeholder.png"}
        />
      </Avatar>
      <div className="flex flex-col max-w-[120px] w-[120px]">
        <p className="b3-medium truncate">{`${user.firstName} ${user.lastName}`}</p>
        <p className="b4-regular text-neutral-600 truncate">
          {userType === UserType.ADVISOR
            ? "Society Advisor"
            : (user as Student).registrationNumber}
        </p>
      </div>
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
