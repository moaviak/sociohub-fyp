import { DailyMeetingRoom } from "@/features/app/video-meeting/components/daily-meeting-room";
import { useEffect } from "react";
import { useParams } from "react-router";

const MeetingRoomPage = () => {
  const { meetingId } = useParams();

  const meetingCredentials = localStorage.getItem(
    `meeting-credentials-${meetingId}`
  );

  const {
    dailyRoomUrl,
    dailyToken,
  }: { dailyRoomUrl: string; dailyToken: string } = meetingCredentials
    ? JSON.parse(meetingCredentials)
    : {};

  useEffect(() => {
    return () => {
      if (meetingId) {
        localStorage.removeItem(`meeting-credentials-${meetingId}`);
      }
    };
  }, [meetingId]);

  if (!dailyRoomUrl || !dailyToken) {
    return (
      <div className="flex flex-col h-screen w-screen items-center justify-center">
        <div className="text-2xl font-bold">
          Meeting credentials not found⚠️
        </div>
        <p className="text-sm text-muted-foreground">
          Please try again or contact support if the problem persists.
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen">
      <DailyMeetingRoom dailyRoomUrl={dailyRoomUrl} dailyToken={dailyToken} />
    </div>
  );
};
export default MeetingRoomPage;
