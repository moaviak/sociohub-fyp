import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, AlertCircle } from "lucide-react";
import { useMeeting } from "@/contexts/meeting-context";
import { PreJoinMeeting } from "./pre-join-meeting";
import { MeetingRoom } from "./meeting-room";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MeetingModalProps {
  open: boolean;
  onClose: () => void;
}

export const MeetingModal: React.FC<MeetingModalProps> = ({
  open,
  onClose,
}) => {
  const { state, meeting, error, clearError, reset, leaveMeeting } =
    useMeeting();

  // Handle modal close
  const handleClose = () => {
    if (state === "in-meeting") {
      leaveMeeting();
    } else {
      reset();
      onClose();
    }
  };

  // Handle escape key and backdrop click prevention during meeting
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state === "in-meeting") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, state]);

  // Auto-close modal when meeting ends
  useEffect(() => {
    if (state === "ended") {
      setTimeout(() => {
        reset();
        onClose();
      }, 2000);
    }
  }, [state, reset, onClose]);

  // Render different content based on meeting state
  const renderContent = () => {
    if (error) {
      return (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={clearError}>
              Try Again
            </Button>
            <Button onClick={handleClose}>Close</Button>
          </div>
        </div>
      );
    }

    switch (state) {
      case "pre-join":
        return <PreJoinMeeting />;

      case "in-meeting":
        return <MeetingRoom />;

      case "ending":
        return (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Leaving meeting...</p>
            </div>
          </div>
        );

      case "ended":
        return (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">Meeting ended</p>
              <p className="text-muted-foreground">Thank you for joining!</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Get modal title based on state
  const getModalTitle = () => {
    if (error) return "Meeting Error";

    switch (state) {
      case "pre-join":
        return `Join ${meeting?.title || "Meeting"}`;
      case "in-meeting":
        return meeting?.title || "Meeting";
      case "ending":
        return "Leaving Meeting";
      case "ended":
        return "Meeting Ended";
      default:
        return "Meeting";
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={state === "in-meeting" ? undefined : handleClose}
    >
      <DialogContent
        className={`${
          state === "in-meeting"
            ? "max-w-[95vw] max-h-[95vh] w-full h-full"
            : "max-w-2xl"
        }`}
      >
        <DialogHeader className={state === "in-meeting" ? "sr-only" : ""}>
          <DialogTitle className="flex items-center justify-between">
            <span>{getModalTitle()}</span>
            {state !== "in-meeting" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className={state === "in-meeting" ? "h-full" : ""}>
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
