import React from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useJoinMeetingMutation } from "../api";
import { toast } from "sonner";
import ApiError from "@/features/api-error";
import { Meeting } from "@/types";
import { useMeeting } from "@/contexts/meeting-context";

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

  const {
    setState,
    setMeeting,
    setCredentials,
    setError,
    reset,
    showMeetingModal,
  } = useMeeting();

  const onJoin = async () => {
    try {
      // Show loading state
      if (showLoading) {
        showLoading("Joining Meeting");
      }

      // Reset any previous meeting state
      reset();

      // Set current meeting in context
      setMeeting(meeting);

      // Call the API to get meeting credentials
      const response = await joinMeeting({
        meetingId: meeting.id,
      }).unwrap();

      if (!("error" in response)) {
        const { dailyRoomUrl, dailyToken, meeting: meetingInfo } = response;

        // Set credentials in context
        setCredentials({
          dailyRoomUrl,
          dailyToken,
          meeting: meetingInfo,
        });

        // Set state to pre-join
        setState("pre-join");

        // Open meeting modal
        showMeetingModal();

        toast.success("Ready to join meeting!");
      } else {
        throw response;
      }
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Failed to join meeting";

      setError(message);
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
        <LogIn className="h-4 w-4 mr-2" />
        {isLoading ? "Joining..." : "Join Meeting"}
      </Button>
    </>
  );
};
