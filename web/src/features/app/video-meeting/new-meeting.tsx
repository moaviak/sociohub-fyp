import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { MeetingForm } from "./meeting-form";

export const NewMeeting = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4" />
          New meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl flex flex-col gap-y-4 min-h-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary-600 h5-semibold">
            Create a new meeting
          </DialogTitle>
          <DialogDescription>
            To create a new meeting, please provide the necessary details.
          </DialogDescription>
        </DialogHeader>
        <MeetingForm onSuccess={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
