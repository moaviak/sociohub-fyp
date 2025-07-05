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

interface MeetingMenuProps {
  meeting: Meeting;
}

export const MeetingMenu: React.FC<MeetingMenuProps> = ({ meeting }) => {
  const { user } = useAppSelector((state) => state.auth);
  const { LoadingScreen, hideLoading, showLoading } = useLoadingOverlay();

  const [cancelMeeting, { isLoading: isCancelling }] =
    useCancelMeetingMutation();
  const [endMeeting, { isLoading: isEnding }] = useEndMeetingMutation();

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

  const isHost =
    user!.id === meeting.hostAdvisorId || user!.id === meeting.hostStudentId;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="b3-regular">
          <Button variant={"ghost"} size={"inline"}>
            <ReceiptText className="h-4 w-4 mr-2" />
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
            <DropdownMenuItem className="b3-regular">
              <Button
                variant={"ghost"}
                size={"inline"}
                disabled={isEnding}
                onClick={handleEnd}
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
  );
};
