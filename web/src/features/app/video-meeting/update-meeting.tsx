import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SquarePen } from "lucide-react";
import { useEffect, useState } from "react";
import { MeetingForm } from "./meeting-form";
import { Meeting } from "@/types";

interface UpdateMeetingProps {
  meeting: Meeting;
  onClose?: () => void;
}

export const UpdateMeeting: React.FC<UpdateMeetingProps> = ({
  meeting,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(onClose ? true : false);

  useEffect(() => {
    if (onClose) {
      setIsOpen(true);
    }
  }, [onClose]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Notify parent component
      if (onClose) {
        // Use requestAnimationFrame to ensure the state is updated before unmounting
        requestAnimationFrame(() => {
          onClose();
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} modal>
      {!onClose && (
        <DialogTrigger asChild>
          <Button variant={"ghost"} size={"inline"}>
            <SquarePen className="text-inherit mr-2 h-4 w-4" />
            Update Meeting
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-3xl flex flex-col gap-y-4 min-h-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary-600 h5-semibold">
            Update Meeting
          </DialogTitle>
          <DialogDescription>Update the meeting details</DialogDescription>
        </DialogHeader>
        <MeetingForm
          onSuccess={() => handleOpenChange(false)}
          meeting={meeting}
        />
      </DialogContent>
    </Dialog>
  );
};
