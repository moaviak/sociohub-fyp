import { useAppSelector } from "@/app/hooks";
import { TeamMember } from "../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Loader2, Mail, MoreVertical, UserX } from "lucide-react";
import { Link } from "react-router";
import { useRemoveMemberFromTeamMutation } from "../api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ApiError from "@/features/api-error";
import { SendChat } from "../../chats/components/send-chat";

export const MemberCard: React.FC<{
  member: TeamMember;
  teamId: string;
  leadId?: string;
  isLead?: boolean;
}> = ({ member, isLead, leadId, teamId }) => {
  const user = useAppSelector((state) => state.auth.user);

  const [removeMember, { isLoading }] = useRemoveMemberFromTeamMutation();

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const handleRemoveMember = async () => {
    try {
      await removeMember({
        teamId: teamId!,
        studentId: member.student.id,
      }).unwrap();

      toast.success("Member removed from team successfully");
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Failed to remove member";
      toast.error(message);
    }
  };

  const showOptions = user?.id === leadId && !isLead;

  return (
    <div className="group flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-200 rounded-lg border border-transparent hover:border-gray-200">
      <div className="flex items-center gap-4 flex-1">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
            <AvatarImage src={member.student.avatar ?? ""} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {member.student.firstName![0]}
              {member.student.lastName![0]}
            </AvatarFallback>
          </Avatar>

          {/* Leader Crown */}
          {isLead && (
            <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-sm">
              <Crown className="h-3 w-3 text-amber-500" />
            </div>
          )}
        </div>

        {/* Member Info */}
        <Link to={`/profile/${member.student.id}`}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {member.student.firstName} {member.student.lastName}
              </h3>

              {/* Role Badge */}
              {isLead && (
                <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 text-xs font-medium">
                  <Crown className="mr-1 h-3 w-3" />
                  Lead
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {member.student.email}
              </span>
              <span>Joined {formatJoinDate(member.joinedAt)}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Actions Dropdown - Only visible for leaders */}
      {showOptions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <SendChat userId={member.studentId}>
              <DropdownMenuItem className="cursor-pointer">
                <Mail className="mr-2 h-4 w-4 text-inherit" />
                Send Message
              </DropdownMenuItem>
            </SendChat>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleRemoveMember}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserX className="mr-2 h-4 w-4 text-inherit" />
              )}
              Remove from Team
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
