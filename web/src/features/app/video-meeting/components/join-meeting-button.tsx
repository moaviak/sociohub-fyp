import React from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useJoinMeetingMutation } from "../api";
import { toast } from "sonner";
import ApiError from "@/features/api-error";
import { Meeting } from "@/types";
import { useNavigate } from "react-router";

interface JoinMeetingButtonProps {
  meeting: Meeting;
  showLoading?: (message: string) => void;
  hideLoading?: () => void;
}

export const JoinMeetingButton: React.FC<JoinMeetingButtonProps> = ({
  meeting,
  showLoading,
  hideLoading,
}) => {
  const [joinMeeting, { isLoading }] = useJoinMeetingMutation();
  const navigate = useNavigate();

  const onJoin = async () => {
    try {
      // Show loading state
      if (showLoading) {
        showLoading("Joining Meeting");
      }

      // Call the API to get meeting credentials
      const response = await joinMeeting({
        meetingId: meeting.id,
      }).unwrap();

      if (!("error" in response)) {
        const { dailyRoomUrl, dailyToken, meeting: meetingInfo } = response;

        // Set credentials in session storage
        localStorage.setItem(
          `meeting-credentials-${meetingInfo.id}`,
          JSON.stringify({ dailyRoomUrl, dailyToken })
        );

        navigate(`/meeting-room/${meetingInfo.id}`);

        toast.success("Ready to join meeting!");
      } else {
        throw response;
      }
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Failed to join meeting";

      toast.error(message);
    } finally {
      if (hideLoading) {
        hideLoading();
      }
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="inline"
        onClick={onJoin}
        disabled={isLoading}
      >
        <LogIn className="text-inherit h-4 w-4 mr-2" />
        {isLoading ? "Joining..." : "Join Meeting"}
      </Button>
    </>
  );
};
