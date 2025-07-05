import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReceiptText } from "lucide-react";
import { useEffect, useState } from "react";
import { useGetMeetingByIdQuery } from "../../api";
import { SpinnerLoader } from "@/components/spinner-loader";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MeetingStatus, UserType } from "@/types";
import { AvatarGroup } from "@/components/avatar-group";
import { TimingAndAccess } from "./timing-and-access";
import { AboutMeeting } from "./about-meeting";
import { Audience } from "./audience";
import { Participants } from "./participants";
import { useAppSelector } from "@/app/hooks";

interface MeetingDetailsProps {
  meetingId: string;
  onClose?: () => void;
}

export const MeetingDetails: React.FC<MeetingDetailsProps> = ({
  meetingId,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(onClose ? true : false);
  const { user } = useAppSelector((state) => state.auth);

  const { data, isFetching } = useGetMeetingByIdQuery({ meetingId });

  const meeting = data && !("error" in data) ? data : undefined;

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

  if (isFetching) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange} modal>
        <DialogContent className="sm:max-w-3xl aspect-[5/3] min-h-0 max-h-[90vh]">
          <div className="h-full w-full flex justify-center items-center">
            <SpinnerLoader size="md" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!meeting) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange} modal>
        <DialogContent className="sm:max-w-lg flex justify-center items-center">
          <p className="b3-regular">
            ⚠️ Something went wrong while fetching the meeting details.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  const host = meeting.hostAdvisor || meeting.hostStudent!;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} modal>
      {!onClose && (
        <DialogTrigger asChild>
          <Button variant={"ghost"} size={"inline"}>
            <ReceiptText className="text-inherit h-4 w-4 mr-2" />
            View Detail
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-3xl min-h-0 max-h-[90vh] overflow-hidden px-0 flex flex-col gap-y-4">
        <DialogHeader className="px-6">
          <DialogTitle className="text-primary-600 h5-semibold">
            {meeting?.title}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto custom-scrollbar space-y-4 px-6">
          <div className="grid grid-cols-2">
            <div className="flex gap-4 items-center">
              <p className="b2-semibold">Status:</p>
              <Badge
                variant={"outline"}
                className={cn(
                  "b3-medium",
                  meeting.status === MeetingStatus.SCHEDULED &&
                    "bg-secondary-100 border-secondary-400 text-secondary-600",
                  meeting.status === MeetingStatus.LIVE &&
                    "bg-red-100 border-red-300 text-red-500",
                  meeting.status === MeetingStatus.ENDED &&
                    "bg-emerald-100 border-emerald-300 text-emerald-500",
                  meeting.status === MeetingStatus.CANCELLED &&
                    "bg-accent-100 border-accent-300 text-accent-500"
                )}
              >
                {meeting.status}
              </Badge>
            </div>

            <div className="flex gap-4 items-center">
              <p className="b2-semibold">Hosted By:</p>
              <AvatarGroup
                user={host}
                userType={
                  "registrationNumber" in host
                    ? UserType.STUDENT
                    : UserType.ADVISOR
                }
              />
            </div>
          </div>

          <TimingAndAccess meeting={meeting} />
          <AboutMeeting meeting={meeting} />
          <Audience meeting={meeting} />
          {[MeetingStatus.ENDED, MeetingStatus.LIVE].includes(meeting.status) &&
            user!.id === host.id && <Participants meeting={meeting} />}
        </div>
      </DialogContent>
    </Dialog>
  );
};
