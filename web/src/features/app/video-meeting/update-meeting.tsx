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
import { useState } from "react";
import { MeetingForm } from "./meeting-form";
import { Meeting } from "@/types";

interface UpdateMeetingProps {
  meeting: Meeting;
}

export const UpdateMeeting: React.FC<UpdateMeetingProps> = ({ meeting }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={"ghost"} size={"inline"}>
          <SquarePen className="text-inherit mr-2 h-4 w-4" />
          Update Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl flex flex-col gap-y-4 min-h-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary-600 h5-semibold">
            Update Meeting
          </DialogTitle>
          <DialogDescription>Update the meeting details</DialogDescription>
        </DialogHeader>
        <MeetingForm onSuccess={() => setIsOpen(false)} meeting={meeting} />
      </DialogContent>
    </Dialog>
  );
};
