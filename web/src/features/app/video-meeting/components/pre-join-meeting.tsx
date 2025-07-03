import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Users,
  Clock,
  Crown,
  Settings,
  Monitor,
} from "lucide-react";
import { useMeeting } from "@/contexts/meeting-context";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { DailyEventObject } from "@daily-co/daily-js";

export const PreJoinMeeting: React.FC = () => {
  const {
    meeting,
    credentials,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
    setState,
    setCallState,
    setError,
  } = useMeeting();

  const [isJoining, setIsJoining] = useState(false);
  const [devicePermissions, setDevicePermissions] = useState({
    camera: false,
    microphone: false,
  });
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("");
  const [devices, setDevices] = useState<{
    cameras: MediaDeviceInfo[];
    microphones: MediaDeviceInfo[];
  }>({
    cameras: [],
    microphones: [],
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get user media and device permissions
  useEffect(() => {
    let mounted = true;

    const initializeDevices = async () => {
      try {
        // Request permissions
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!mounted) return;

        streamRef.current = stream;

        // Set video stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Get available devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(
          (device) => device.kind === "videoinput"
        );
        const microphones = devices.filter(
          (device) => device.kind === "audioinput"
        );

        setDevices({ cameras, microphones });
        setDevicePermissions({ camera: true, microphone: true });

        // Set default devices
        if (cameras.length > 0) {
          setSelectedCamera(cameras[0].deviceId);
        }
        if (microphones.length > 0) {
          setSelectedMicrophone(microphones[0].deviceId);
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
        setDevicePermissions({ camera: false, microphone: false });
        toast.error("Unable to access camera or microphone");
      }
    };

    initializeDevices();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle device changes
  useEffect(() => {
    if (!streamRef.current) return;

    const updateStream = async () => {
      try {
        // Stop current stream
        streamRef.current?.getTracks().forEach((track) => track.stop());

        // Get new stream with selected devices
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: selectedCamera ? { deviceId: selectedCamera } : true,
          audio: selectedMicrophone ? { deviceId: selectedMicrophone } : true,
        });

        streamRef.current = newStream;

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (error) {
        console.error("Error updating media stream:", error);
      }
    };

    updateStream();
  }, [selectedCamera, selectedMicrophone]);

  // Handle video/audio toggle
  useEffect(() => {
    if (!streamRef.current) return;

    const videoTrack = streamRef.current.getVideoTracks()[0];
    const audioTrack = streamRef.current.getAudioTracks()[0];

    if (videoTrack) {
      videoTrack.enabled = isVideoEnabled;
    }
    if (audioTrack) {
      audioTrack.enabled = isAudioEnabled;
    }
  }, [isVideoEnabled, isAudioEnabled]);

  const handleJoinMeeting = async () => {
    if (!credentials) {
      setError("Missing meeting credentials");
      return;
    }

    setIsJoining(true);
    setCallState("joining");

    try {
      // Import Daily.co dynamically
      const DailyIframe = (await import("@daily-co/daily-js")).default;

      // Create call object
      const callObject = DailyIframe.createCallObject({
        url: credentials.dailyRoomUrl,
        token: credentials.dailyToken,
      });

      // Set up event listeners before joining
      callObject
        .on("joined-meeting", () => {
          setCallState("joined");
          setState("in-meeting");
          toast.success("Successfully joined the meeting!");
        })
        .on("left-meeting", () => {
          setCallState("left");
          setState("ended");
        })
        .on("error", (event: DailyEventObject) => {
          console.error("Daily.co error:", event);
          setError(`Meeting error: ${event.errorMsg || "Unknown error"}`);
          setCallState("error");
        })
        .on("participant-joined", (event: DailyEventObject) => {
          console.log("Participant joined:", event.participant);
        })
        .on("participant-left", (event: DailyEventObject) => {
          console.log("Participant left:", event.participant);
        });

      // Join the meeting
      await callObject.join({
        userName: credentials.meeting.host,
        startVideoOff: !isVideoEnabled,
        startAudioOff: !isAudioEnabled,
      });

      // Store call object in context
      // This will be handled by the MeetingRoom component
    } catch (error) {
      console.error("Error joining meeting:", error);
      setError("Failed to join meeting. Please try again.");
      setCallState("error");
    } finally {
      setIsJoining(false);
    }
  };

  if (!meeting || !credentials) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading meeting details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Meeting Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {meeting.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {meeting.scheduledAt && (
              <span>
                Started {formatDistanceToNow(new Date(meeting.scheduledAt))} ago
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback>
                {credentials.meeting.host.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">
              {credentials.meeting.host}
            </span>
            {credentials.meeting.isHost && (
              <Badge variant="secondary" className="text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Host
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Camera Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Camera Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            {devicePermissions.camera ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${
                  !isVideoEnabled ? "opacity-0" : ""
                }`}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <VideoOff className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Camera access denied</p>
                </div>
              </div>
            )}

            {!isVideoEnabled && devicePermissions.camera && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center text-white">
                  <VideoOff className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Camera is off</p>
                </div>
              </div>
            )}
          </div>

          {/* Media Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isVideoEnabled ? "default" : "secondary"}
              size="sm"
              onClick={toggleVideo}
              disabled={!devicePermissions.camera}
            >
              {isVideoEnabled ? (
                <Video className="h-4 w-4 mr-2" />
              ) : (
                <VideoOff className="h-4 w-4 mr-2" />
              )}
              {isVideoEnabled ? "Camera On" : "Camera Off"}
            </Button>

            <Button
              variant={isAudioEnabled ? "default" : "secondary"}
              size="sm"
              onClick={toggleAudio}
              disabled={!devicePermissions.microphone}
            >
              {isAudioEnabled ? (
                <Mic className="h-4 w-4 mr-2" />
              ) : (
                <MicOff className="h-4 w-4 mr-2" />
              )}
              {isAudioEnabled ? "Mic On" : "Mic Off"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Device Settings */}
      {(devices.cameras.length > 1 || devices.microphones.length > 1) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Device Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {devices.cameras.length > 1 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Camera</label>
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {devices.cameras.map((camera) => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {devices.microphones.length > 1 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Microphone</label>
                <select
                  value={selectedMicrophone}
                  onChange={(e) => setSelectedMicrophone(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {devices.microphones.map((microphone) => (
                    <option
                      key={microphone.deviceId}
                      value={microphone.deviceId}
                    >
                      {microphone.label ||
                        `Microphone ${microphone.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Join Button */}
      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleJoinMeeting}
          disabled={isJoining}
          className="px-8"
        >
          {isJoining ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Joining...
            </>
          ) : (
            <>
              <Monitor className="h-4 w-4 mr-2" />
              Join Meeting
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
