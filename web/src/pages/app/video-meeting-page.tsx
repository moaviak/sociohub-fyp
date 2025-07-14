import { Navigate, useParams } from "react-router";
import { useAppSelector } from "@/app/hooks";
import { VideoMeeting } from "@/features/app/video-meeting";
import { JoinWithCode } from "@/features/app/video-meeting/join-with-code";
import { NewMeeting } from "@/features/app/video-meeting/new-meeting";
import { haveMeetingsPrivilege } from "@/lib/utils";
import { Advisor } from "@/types";

const VideoMeetingPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { societyId } = useParams();

  const isStudent = user && "registrationNumber" in user;

  if (isStudent && !societyId) {
    return <Navigate to="/dashboard" />;
  }

  const havePrivilege = isStudent
    ? haveMeetingsPrivilege(user.societies || [], societyId || "")
    : !societyId || societyId === (user as Advisor).societyId;

  return (
    <div className="flex flex-col px-4 py-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="h3-semibold">Video Meetings</h3>
          <p className="b3-regular">
            Connect, collaborate, and communicate with your societies in
            real-time.
          </p>
        </div>
        <div className="flex gap-x-4">
          {havePrivilege && <NewMeeting />}
          <JoinWithCode />
        </div>
      </div>
      <div className="flex-1 flex">
        <VideoMeeting />
      </div>
    </div>
  );
};
export default VideoMeetingPage;
