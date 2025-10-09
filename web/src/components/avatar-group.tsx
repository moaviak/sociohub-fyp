import { Link } from "react-router";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Advisor, Student, UserType } from "@/types";
import { cn } from "@/lib/utils";

interface AvatarGroupProps {
  user: Student | Advisor;
  userType: UserType;
  className?: string;
  redirect?: boolean;
  variant?: "default" | "top-bar";
}

export const AvatarGroup = ({
  user,
  userType,
  className,
  redirect = true,
  variant = "default",
}: AvatarGroupProps) => {
  return (
    <Link
      to={redirect ? `/profile/${user.id}` : ""}
      className={cn("flex gap-x-3 items-center", className)}
    >
      <Avatar className="size-10 cursor-pointer">
        <AvatarImage src={user.avatar} className="object-cover" />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
          {user.firstName![0]}
          {user.lastName![0]}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "flex flex-col overflow-hidden text-ellipsis whitespace-nowrap",
          variant === "top-bar" ? "hidden md:flex" : ""
        )}
      >
        <p className="b3-medium truncate">{`${user.firstName} ${user.lastName}`}</p>
        <p className="b4-regular text-neutral-600 truncate">
          {userType === UserType.ADVISOR
            ? "Society Advisor"
            : (user as Student).registrationNumber}
        </p>
      </div>
    </Link>
  );
};
