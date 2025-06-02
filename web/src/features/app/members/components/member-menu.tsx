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
import { haveMembersPrivilege, haveTasksPrivilege } from "@/lib/utils";

import { RemoveMemberDialog } from "./remove-member-dialog";
import { useState } from "react";
import { ManageRoles } from "./manage-roles";
import { AssignTask } from "./assign-task";

interface MemberMenuProps {
  member: Member;
}

export const MemberMenu = ({ member }: MemberMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showRolesDialog, setShowRolesDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);

  const { user } = useAppSelector((state) => state.auth);
  const societyId = useGetSocietyId();

  const isStudent = user && "registrationNumber" in user;
  const havePrivilege = isStudent
    ? haveMembersPrivilege(user.societies || [], societyId || "")
    : true;
  const haveTaskPrivilege = isStudent
    ? haveTasksPrivilege(user.societies || [], societyId || "")
    : true;

  const handleRemoveMember = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    // Small delay before showing the dialog to avoid UI glitches
    setTimeout(() => {
      setShowRemoveDialog(true);
    }, 50);
  };

  const handleManageRoles = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    // Small delay before showing the dialog to avoid UI glitches
    setTimeout(() => {
      setShowRolesDialog(true);
    }, 50);
  };

  const handleAssignTask = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    // Small delay before showing the dialog to avoid UI glitches
    setTimeout(() => {
      setShowTaskDialog(true);
    }, 50);
  };

  // Always reset dialog states when the dropdown closes
  const handleDropdownOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Small delay to prevent UI conflicts
      setTimeout(() => {
        if (!showRemoveDialog && !showRolesDialog) {
          document.body.click(); // Clear any potential stuck states
        }
      }, 100);
    } else {
      // When opening the dropdown, ensure dialogs are closed
      setShowRemoveDialog(false);
      setShowRolesDialog(false);
    }
  };

  // This ensures the dialogs will be reopened next time
  const handleRemoveDialogClose = () => {
    setShowRemoveDialog(false);
  };

  const handleRolesDialogClose = () => {
    setShowRolesDialog(false);
  };

  const handleTaskDialogClose = () => {
    setShowTaskDialog(false);
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={handleDropdownOpenChange}>
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
            <DropdownMenuItem
              className="b3-regular"
              onSelect={(e) => e.preventDefault()}
            >
              <p
                className="cursor-pointer b3-regular"
                onClick={handleManageRoles}
              >
                Manage Roles
              </p>
            </DropdownMenuItem>
          )}
          {member.id !== user?.id && (
            <DropdownMenuItem className="b3-regular">
              Send Message
            </DropdownMenuItem>
          )}
          {haveTaskPrivilege && member.id !== user?.id && (
            <DropdownMenuItem
              className="b3-regular"
              onSelect={(e) => e.preventDefault()}
            >
              <p
                className="cursor-pointer b3-regular"
                onClick={handleAssignTask}
              >
                Assign Task
              </p>
            </DropdownMenuItem>
          )}
          {havePrivilege && (
            <>
              <DropdownMenuSeparator className="bg-neutral-300" />
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Button
                  variant="ghost"
                  size="inline"
                  className="text-red-600"
                  onClick={handleRemoveMember}
                >
                  Remove Member
                </Button>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {showRemoveDialog && (
        <RemoveMemberDialog
          key={`remove-${member.id}`}
          member={member}
          onClose={handleRemoveDialogClose}
        />
      )}

      {showRolesDialog && (
        <ManageRoles
          key={`roles-${member.id}`}
          member={member}
          onClose={handleRolesDialogClose}
        />
      )}

      {showTaskDialog && (
        <AssignTask
          key={`task-${member.id}`}
          member={member}
          onClose={handleTaskDialogClose}
        />
      )}
    </>
  );
};
