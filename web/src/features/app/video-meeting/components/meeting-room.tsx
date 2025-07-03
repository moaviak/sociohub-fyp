import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  MessageCircle,
  Users,
  Phone,
  MoreHorizontal,
  Crown,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useMeeting } from "@/contexts/meeting-context";
import { toast } from "sonner";
import { DailyEventObject, DailyParticipant } from "@daily-co/daily-js";

export const MeetingRoom: React.FC = () => {
  const {
    meeting,
    credentials,
    participants,
    callObject,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    isChatVisible,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleChat,
    leaveMeeting,
    setCallObject,
    setParticipants,
    setState,
    setError,
  } = useMeeting();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [localParticipant, setLocalParticipant] =
    useState<DailyParticipant | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<
    DailyParticipant[]
  >([]);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Daily.co call object when component mounts
  useEffect(() => {
    if (!callObject && credentials) {
      initializeDailyCall();
    }

    return () => {
      // Cleanup on unmount
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [callObject, credentials]);

  // Start meeting duration timer
  useEffect(() => {
    if (callObject) {
      durationIntervalRef.current = setInterval(() => {
        setMeetingDuration((prev) => prev + 1);
      }, 1000);

      return () => {
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }
      };
    }
  }, [callObject]);

  const initializeDailyCall = async () => {
    try {
      const DailyIframe = (await import("@daily-co/daily-js")).default;

      const call = DailyIframe.createCallObject({
        url: credentials?.dailyRoomUrl,
        token: credentials?.dailyToken,
      });

      // Set up event listeners
      call
        .on("joined-meeting", (event: DailyEventObject) => {
          console.log("Joined meeting:", event);
          setLocalParticipant(event.participants.local);
          updateParticipants(event.participants);
        })
        .on("participant-joined", (event: DailyEventObject) => {
          console.log("Participant joined:", event.participant);
          toast.success(
            `${event.participant.user_name || "Someone"} joined the meeting`
          );
          updateParticipants();
        })
        .on("participant-left", (event: DailyEventObject) => {
          console.log("Participant left:", event.participant);
          toast.info(
            `${event.participant.user_name || "Someone"} left the meeting`
          );
          updateParticipants();
        })
        .on("participant-updated", (event: DailyEventObject) => {
          console.log("Participant updated:", event.participant);
          updateParticipants();
        })
        .on("active-speaker-change", (event: DailyEventObject) => {
          setActiveSpeaker(event.activeSpeaker?.peerId || null);
        })
        .on("recording-started", () => {
          setIsRecording(true);
          toast.info("Recording started");
        })
        .on("recording-stopped", () => {
          setIsRecording(false);
          toast.info("Recording stopped");
        })
        .on("error", (event: DailyEventObject) => {
          console.error("Daily.co error:", event);
          setError(`Meeting error: ${event.errorMsg || "Unknown error"}`);
        })
        .on("left-meeting", () => {
          setState("ended");
        });

      setCallObject(call);
    } catch (error) {
      console.error("Error initializing Daily.co:", error);
      setError("Failed to initialize meeting. Please try again.");
    }
  };

  const updateParticipants = (participantsData?: DailyParticipant) => {
    if (!callObject) return;

    const participants = participantsData || callObject.participants();
    const participantList = Object.values(participants);

    setParticipants(participantList);

    const local = participantList.find((p: DailyParticipant) => p.local);
    const remote = participantList.filter((p: DailyParticipant) => !p.local);

    setLocalParticipant(local);
    setRemoteParticipants(remote);
  };

  const handleAudioToggle = async () => {
    if (!callObject) return;

    try {
      await callObject.setLocalAudio(!isAudioEnabled);
      toggleAudio();
    } catch (error) {
      console.error("Error toggling audio:", error);
      toast.error("Failed to toggle audio");
    }
  };

  const handleVideoToggle = async () => {
    if (!callObject) return;

    try {
      await callObject.setLocalVideo(!isVideoEnabled);
      toggleVideo();
    } catch (error) {
      console.error("Error toggling video:", error);
      toast.error("Failed to toggle video");
    }
  };

  const handleScreenShare = async () => {
    if (!callObject) return;

    try {
      if (isScreenSharing) {
        await callObject.stopScreenShare();
      } else {
        await callObject.startScreenShare();
      }
      toggleScreenShare();
    } catch (error) {
      console.error("Error toggling screen share:", error);
      toast.error("Failed to toggle screen share");
    }
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getParticipantInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderParticipantVideo = (
    participant: DailyParticipant,
    isLocal: boolean = false
  ) => {
    const isActive = activeSpeaker === participant.session_id;
    const hasVideo = participant.tracks.video && !participant.tracks.video.off;

    return (
      <div
        key={participant.session_id}
        className={`relative bg-gray-900 rounded-lg overflow-hidden ${
          isActive ? "ring-2 ring-blue-500" : ""
        } ${isLocal ? "col-span-2" : ""}`}
      >
        {hasVideo ? (
          <video
            ref={
              isLocal
                ? (el) => {
                    if (el && participant.tracks.video.track) {
                      el.srcObject = new MediaStream([
                        participant.tracks.video.track,
                      ]);
                    }
                  }
                : undefined
            }
            autoPlay
            muted={isLocal}
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Avatar className="w-16 h-16">
              <AvatarImage src="" />
              <AvatarFallback className="text-lg">
                {getParticipantInitials(participant.user_name || "User")}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* Participant info overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {participant.user_name || "Unknown"}
              {isLocal && " (You)"}
            </Badge>
            {participant.permissions?.canAdmin && (
              <Badge variant="outline" className="text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Host
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            {participant.tracks.audio.off && (
              <div className="bg-red-500 rounded-full p-1">
                <MicOff className="h-3 w-3 text-white" />
              </div>
            )}
            {isActive && (
              <div className="bg-green-500 rounded-full p-1">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!meeting || !credentials) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading meeting room...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">{meeting.title}</h1>
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              REC
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{participants.length} participants</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{formatDuration(meetingDuration)}</span>
          </div>

          <Button variant="ghost" size="sm" onClick={handleFullscreen}>
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Grid */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
            {/* Local participant */}
            {localParticipant && renderParticipantVideo(localParticipant, true)}

            {/* Remote participants */}
            {remoteParticipants.map((participant) =>
              renderParticipantVideo(participant)
            )}

            {/* Empty slots for better layout */}
            {Array.from({ length: Math.max(0, 6 - participants.length) }).map(
              (_, index) => (
                <div
                  key={`empty-${index}`}
                  className="bg-gray-200 rounded-lg flex items-center justify-center opacity-50"
                >
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
              )
            )}
          </div>
        </div>

        {/* Chat Sidebar */}
        {isChatVisible && (
          <div className="w-80 border-l bg-white">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Chat
              </h3>
            </div>

            <div className="flex-1 p-4">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Chat feature coming soon</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-center justify-center gap-2">
          {/* Audio Toggle */}
          <Button
            variant={isAudioEnabled ? "default" : "destructive"}
            size="lg"
            onClick={handleAudioToggle}
            className="rounded-full w-12 h-12 p-0"
          >
            {isAudioEnabled ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </Button>

          {/* Video Toggle */}
          <Button
            variant={isVideoEnabled ? "default" : "destructive"}
            size="lg"
            onClick={handleVideoToggle}
            className="rounded-full w-12 h-12 p-0"
          >
            {isVideoEnabled ? (
              <Video className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
          </Button>

          {/* Screen Share */}
          <Button
            variant={isScreenSharing ? "default" : "secondary"}
            size="lg"
            onClick={handleScreenShare}
            className="rounded-full w-12 h-12 p-0"
          >
            {isScreenSharing ? (
              <Monitor className="h-5 w-5" />
            ) : (
              <MonitorOff className="h-5 w-5" />
            )}
          </Button>

          {/* Chat Toggle */}
          <Button
            variant={isChatVisible ? "default" : "secondary"}
            size="lg"
            onClick={toggleChat}
            className="rounded-full w-12 h-12 p-0"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>

          {/* More Options */}
          <Button
            variant="secondary"
            size="lg"
            className="rounded-full w-12 h-12 p-0"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>

          <Separator orientation="vertical" className="h-8 mx-2" />

          {/* Leave Meeting */}
          <Button
            variant="destructive"
            size="lg"
            onClick={leaveMeeting}
            className="rounded-full px-6"
          >
            <Phone className="h-5 w-5 mr-2" />
            Leave
          </Button>
        </div>
      </div>
    </div>
  );
};
