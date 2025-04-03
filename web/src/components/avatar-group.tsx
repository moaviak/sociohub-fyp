import { useNavigate } from "react-router";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Advisor, Student, UserType } from "@/types";
import { cn } from "@/lib/utils";

interface AvatarGroupProps {
  user: Student | Advisor;
  userType: UserType;
  className?: string;
}

export const AvatarGroup = ({
  user,
  userType,
  className,
}: AvatarGroupProps) => {
  const navigate = useNavigate();

  return (
    <div className={cn("flex gap-x-3 items-center", className)}>
      <Avatar
        onClick={() => navigate(`/profile/${user.id}`)}
        className="h-10 w-10 cursor-pointer"
      >
        <AvatarImage
          src={user.avatar ?? "/assets/images/avatar-placeholder.png"}
        />
      </Avatar>
      <div className="flex flex-col overflow-hidden text-ellipsis whitespace-nowrap">
        <p className="b3-medium truncate">{`${user.firstName} ${user.lastName}`}</p>
        <p className="b4-regular text-neutral-600 truncate">
          {userType === UserType.ADVISOR
            ? "Society Advisor"
            : (user as Student).registrationNumber}
        </p>
      </div>
    </div>
  );
};
