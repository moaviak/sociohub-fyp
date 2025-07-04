import React, { useEffect, useRef } from "react";

interface DailyMeetingRoomProps {
  dailyRoomUrl: string;
  dailyToken: string;
}

export const DailyMeetingRoom: React.FC<DailyMeetingRoomProps> = ({
  dailyRoomUrl,
  dailyToken,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!dailyRoomUrl || !dailyToken) return;
    // Listen for postMessage events from the Daily iframe
    const handleMessage = (event: MessageEvent) => {
      if (
        typeof event.data === "object" &&
        event.origin.includes("daily.co") &&
        event.data?.action === "meeting-ended"
      ) {
        console.log("Meeting Ended.");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [dailyRoomUrl, dailyToken]);

  const roomUrl = `${dailyRoomUrl}?t=${dailyToken}`;

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      <iframe
        ref={iframeRef}
        src={roomUrl}
        allow="camera; microphone; fullscreen; speaker; display-capture"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          backgroundColor: "#000",
        }}
        title="Daily Video Meeting"
      />
    </div>
  );
};
