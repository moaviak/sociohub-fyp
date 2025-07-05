import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Meeting, MeetingStatus } from "@/types";
import {
  Ban,
  MoreHorizontal,
  PhoneMissed,
  ReceiptText,
  SquarePen,
} from "lucide-react";
import { JoinMeetingButton } from "./join-meeting-button";
import useLoadingOverlay from "@/components/loading-overlay";
import { useAppSelector } from "@/app/hooks";
import { useCancelMeetingMutation, useEndMeetingMutation } from "../api";
import { toast } from "sonner";
import ApiError from "@/features/api-error";
import { UpdateMeeting } from "../update-meeting";
import { useState } from "react";
import { MeetingDetails } from "./meeting-details";

interface MeetingMenuProps {
  meeting: Meeting;
}

export const MeetingMenu: React.FC<MeetingMenuProps> = ({ meeting }) => {
  const { user } = useAppSelector((state) => state.auth);
  const { LoadingScreen, hideLoading, showLoading } = useLoadingOverlay();

  const [cancelMeeting, { isLoading: isCancelling }] =
    useCancelMeetingMutation();
  const [endMeeting, { isLoading: isEnding }] = useEndMeetingMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const handleCancel = async () => {
    try {
      const response = await cancelMeeting({ meetingId: meeting.id }).unwrap();

      if (!("error" in response)) {
        toast.success("Meeting successfully cancelled.");
      }
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Something went wrong.";
      toast.error(message);
    }
  };

  const handleEnd = async () => {
    try {
      const response = await endMeeting({ meetingId: meeting.id }).unwrap();

      if (!("error" in response)) {
        toast.success("Meeting successfully ended.");
      }
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Something went wrong.";
      toast.error(message);
    }
  };

  const handleUpdate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsOpen(false);

    setTimeout(() => {
      setShowUpdateDialog(true);
    }, 50);
  };

  const handleDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsOpen(false);

    setTimeout(() => {
      setShowDetailsDialog(true);
    }, 50);
  };

  // Always reset dialog states when the dropdown closes
  const handleDropdownOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Small delay to prevent UI conflicts
      setTimeout(() => {
        if (!showUpdateDialog) {
          document.body.click(); // Clear any potential stuck states
        }
      }, 100);
    } else {
      // When opening the dropdown, ensure dialogs are closed
      setShowUpdateDialog(false);
      setShowDetailsDialog(false);
    }
  };

  const handleUpdateDialogClose = () => {
    setShowUpdateDialog(false);
  };

  const handleDetailsDialogClose = () => {
    setShowDetailsDialog(false);
  };

  const isHost =
    user!.id === meeting.hostAdvisorId || user!.id === meeting.hostStudentId;

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={handleDropdownOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="b3-regular"
            onSelect={(e) => e.preventDefault()}
          >
            <Button variant={"ghost"} size={"inline"} onClick={handleDetails}>
              <ReceiptText className="text-inherit h-4 w-4 mr-2" />
              View Detail
            </Button>
          </DropdownMenuItem>
          {(meeting.status === MeetingStatus.SCHEDULED ||
            meeting.status === MeetingStatus.LIVE) && (
            <DropdownMenuItem className="b3-regular">
              <JoinMeetingButton
                meeting={meeting}
                showLoading={showLoading}
                hideLoading={hideLoading}
              />
            </DropdownMenuItem>
          )}
          {isHost &&
            [MeetingStatus.LIVE, MeetingStatus.SCHEDULED].includes(
              meeting.status
            ) && (
              <DropdownMenuItem
                className="b3-regular"
                onSelect={(e) => e.preventDefault()}
              >
                <Button
                  variant={"ghost"}
                  size={"inline"}
                  onClick={handleUpdate}
                >
                  <SquarePen className="text-inherit mr-2 h-4 w-4" />
                  Update Meeting
                </Button>
              </DropdownMenuItem>
            )}
          {isHost && meeting.status === MeetingStatus.LIVE && (
            <DropdownMenuItem className="b3-regular">
              <Button
                variant={"ghost"}
                size={"inline"}
                className="text-red-500"
                disabled={isEnding}
                onClick={handleEnd}
              >
                <PhoneMissed className="text-inherit mr-2 h-4 w-4" />
                End Meeting
              </Button>
            </DropdownMenuItem>
          )}
          {isHost && meeting.status === MeetingStatus.SCHEDULED && (
            <DropdownMenuItem className="b3-regular">
              <Button
                variant={"ghost"}
                size={"inline"}
                className="text-red-500"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                <Ban className="text-inherit h-4 w-4 mr-2" />
                Cancel Meeting
              </Button>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
        <LoadingScreen />
      </DropdownMenu>

      {showUpdateDialog && (
        <UpdateMeeting
          key={`update-${meeting.id}`}
          meeting={meeting}
          onClose={handleUpdateDialogClose}
        />
      )}

      {showDetailsDialog && (
        <MeetingDetails
          key={`update-${meeting.id}`}
          meetingId={meeting.id}
          onClose={handleDetailsDialogClose}
        />
      )}
    </>
  );
};
