import { toast } from "sonner";
import { useEffect } from "react";
import { Link } from "react-router";
import { MoreHorizontal } from "lucide-react";

import { Member } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ApiError from "@/features/api-error";
import { Button } from "@/components/ui/button";

import { useRemoveMemberMutation } from "../api";

interface MemberMenuProps {
  member: Member;
}

export const MemberMenu = ({ member }: MemberMenuProps) => {
  const [removeMember, { isLoading, isError, error }] =
    useRemoveMemberMutation();

  const onRemove = async () => {
    const response = await removeMember({
      societyId: member.societyId,
      studentId: member.id,
    });

    if (!("error" in response)) {
      toast.success("Student has been removed from the society.");
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="b3-regular">
          <Link to={`/profile/${member.id}`}>View Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="b3-regular">Edit Role</DropdownMenuItem>
        <DropdownMenuItem className="b3-regular">Send Message</DropdownMenuItem>
        <DropdownMenuSeparator className="bg-neutral-300" />
        <DropdownMenuItem>
          <Button
            variant="ghost"
            size="inline"
            className="text-red-600"
            onClick={onRemove}
            disabled={isLoading}
          >
            Remove Member
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
