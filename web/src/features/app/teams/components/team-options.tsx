import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit3, ListTodo, LogOut, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { Team } from "../types";
import { AssignTaskModal } from "./assign-task-modal";
import { useDeleteTeamMutation, useLeaveTeamMutation } from "../api";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import ApiError from "@/features/api-error";

export const TeamOptions: React.FC<{
  team: Team;
  haveTeamsPrivilege?: boolean;
  haveTasksPrivilege?: boolean;
  isMember?: boolean;
  size?: "sm" | "md" | "lg";
}> = ({
  team,
  haveTeamsPrivilege,
  haveTasksPrivilege,
  isMember,
  size = "sm",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTeam] = useDeleteTeamMutation();
  const [leaveTeam, { isLoading: isLeaveLoading }] = useLeaveTeamMutation();
  const navigate = useNavigate();

  const onDeleteTeam = async () => {
    setIsOpen(false);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTeam({ teamId: team.id, societyId: team.societyId }).unwrap();
      toast.success("The team has been successfully deleted.");
      // Navigate back to teams list
      navigate(`/teams/${team.societyId}`);
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Failed to delete team";
      toast.error(message);
    } finally {
      setShowDeleteDialog(false);
    }
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

  const handleDropdownOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Small delay to prevent UI conflicts
      setTimeout(() => {
        if (!showTaskDialog) {
          document.body.click(); // Clear any potential stuck states
        }
      }, 100);
    } else {
      // When opening the dropdown, ensure dialogs are closed
      setShowTaskDialog(false);
    }
  };

  const handleTaskDialogClose = () => {
    setShowTaskDialog(false);
  };

  const handleLeaveTeam = async () => {
    try {
      await leaveTeam({ teamId: team.id }).unwrap();
      toast.success("Successfully left the team");
      navigate(`/teams/${team.societyId}`);
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Failed to leave team";
      toast.error(message);
    }
  };

  const iconSize = size === "sm" ? 4 : size === "md" ? 5 : 6;

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={handleDropdownOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className={`size-${iconSize}`} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {haveTasksPrivilege && (
            <DropdownMenuItem
              onClick={handleAssignTask}
              onSelect={(e) => e.preventDefault()}
              className="cursor-pointer"
            >
              <ListTodo className="mr-2 h-4 w-4" />
              Assign Task
            </DropdownMenuItem>
          )}
          {haveTeamsPrivilege && (
            <>
              <DropdownMenuItem asChild>
                <Link
                  to={`/teams/${team.societyId}/create-team`}
                  state={{ team }}
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Team
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteTeam()}
                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4 text-inherit" />
                Delete Team
              </DropdownMenuItem>
            </>
          )}
          {isMember && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleLeaveTeam}
              disabled={isLeaveLoading}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Leave Team
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {showTaskDialog && (
        <AssignTaskModal team={team} onClose={handleTaskDialogClose} />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this team? This action cannot be
              undone. All team data, including chat messages and files, will be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteConfirm}
            >
              Delete Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
