import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IdCard,
  MessageCircleMore,
  MoreHorizontal,
  MoreVertical,
} from "lucide-react";
import { Link } from "react-router";
import { Advisor, Student } from "@/types";
import { SendChat } from "../../chats/components/send-chat";

interface UserMenuProps {
  user: Student | Advisor;
  variant: "profile" | "explore";
}

export const UserMenu = ({ user, variant = "explore" }: UserMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          {variant === "explore" ? (
            <MoreHorizontal className="h-4 w-4" />
          ) : (
            <MoreVertical className="w-6 h-6 text-neutral-900" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {variant === "explore" && (
          <DropdownMenuItem className="b3-regular">
            <IdCard className="h-4 w-4 mr-2" />
            <Link to={`/profile/${user.id}`}>View Profile</Link>
          </DropdownMenuItem>
        )}
        <SendChat userId={user.id}>
          <DropdownMenuItem className="b3-regular">
            <MessageCircleMore className="h-4 w-4 mr-2" />
            Send Message
          </DropdownMenuItem>
        </SendChat>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
