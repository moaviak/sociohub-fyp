import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Meeting, MeetingStatus } from "@/types";
import { format } from "date-fns";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export const TimingAndAccess: React.FC<{ meeting: Meeting }> = ({
  meeting,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleCopy = async () => {
    if (!meeting.meetingCode) return;
    try {
      await navigator.clipboard.writeText(meeting.meetingCode);
      setCopied(true);
      setTooltipOpen(true);
      setTimeout(() => {
        setCopied(false);
        setTooltipOpen(false);
      }, 1200);
    } catch {
      // fallback or error handling if needed
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between gap-4">
        <h4 className="b1-bold">Timing & Access</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon">
            <ChevronsUpDown className="h-5 w-5" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="flex flex-col gap-2 my-2">
        <div className="flex items-center gap-4">
          <p className="b3-regular">Meeting Code: </p>

          <Hint
            description={copied ? "Copied!" : "Click to copy"}
            open={tooltipOpen}
            onOpenChange={setTooltipOpen}
            delay={200}
          >
            <span
              className={
                "cursor-pointer font-mono bg-muted px-3 py-1 rounded-md border text-base transition-colors duration-150 hover:bg-muted-foreground/10 active:bg-muted-foreground/20"
              }
              onClick={handleCopy}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleCopy();
              }}
              role="button"
              aria-label="Copy meeting code"
            >
              {meeting.meetingCode}
            </span>
          </Hint>
        </div>
        <div className="flex items-center gap-4">
          <p className="b3-regular">Scheduled Time: </p>
          <p className="b3-medium">
            {format(meeting.scheduledAt, "MMMM d, yyyy | hh:mm a")}
          </p>
        </div>
        {[MeetingStatus.LIVE, MeetingStatus.ENDED].includes(meeting.status) && (
          <>
            {meeting.startedAt && (
              <div className="flex items-center gap-4">
                <p className="b3-regular">Start Time: </p>
                <p className="b3-medium">
                  {format(meeting.startedAt, "MMMM d, yyyy | hh:mm a")}
                </p>
              </div>
            )}
            {meeting.endedAt && (
              <div className="flex items-center gap-4">
                <p className="b3-regular">End Time: </p>
                <p className="b3-medium">
                  {format(meeting.endedAt, "MMMM d, yyyy | hh:mm a")}
                </p>
              </div>
            )}
            {meeting.status === MeetingStatus.LIVE && meeting.expiry && (
              <div className="flex items-center gap-4">
                <p className="b3-regular">Expiry Time: </p>
                <p className="b3-medium">
                  {format(meeting.expiry, "MMMM d, yyyy | hh:mm a")}
                </p>
              </div>
            )}
          </>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
