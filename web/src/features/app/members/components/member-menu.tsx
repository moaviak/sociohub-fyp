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
import { Button } from "@/components/ui/button";

import { useAppSelector } from "@/app/hooks";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import { haveMembersPrivilege } from "@/lib/utils";

import { RemoveMemberDialog } from "./remove-member-dialog";

interface MemberMenuProps {
  member: Member;
}

export const MemberMenu = ({ member }: MemberMenuProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const societyId = useGetSocietyId();

  const isStudent = user && "registrationNumber" in user;
  const havePrivilege = isStudent
    ? haveMembersPrivilege(user.societies || [], societyId || "")
    : true;

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
        {havePrivilege && member.id !== user?.id && (
          <DropdownMenuItem className="b3-regular">Edit Role</DropdownMenuItem>
        )}
        {member.id !== user?.id && (
          <DropdownMenuItem className="b3-regular">
            Send Message
          </DropdownMenuItem>
        )}
        {havePrivilege && (
          <>
            <DropdownMenuSeparator className="bg-neutral-300" />
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <RemoveMemberDialog member={member} />
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
