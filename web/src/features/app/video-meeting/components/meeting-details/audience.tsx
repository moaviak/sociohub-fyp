import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { Meeting, MeetingAudienceType } from "@/types";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { meetingInvitationsColumns } from "../../columns";

export const Audience: React.FC<{ meeting: Meeting }> = ({ meeting }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between gap-4">
        <h4 className="b1-bold">Audience</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon">
            <ChevronsUpDown className="h-5 w-5" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="flex flex-col gap-2 my-2">
        <div className="flex items-center gap-4">
          <p className="b3-regular">Audience Type: </p>
          <Badge
            variant={"outline"}
            className={cn(
              meeting.audienceType ===
                MeetingAudienceType.ALL_SOCIETY_MEMBERS &&
                "bg-secondary-100 border-secondary-400 text-secondary-600",
              meeting.audienceType === MeetingAudienceType.SPECIFIC_MEMBERS &&
                "bg-accent-100 border-accent-400 text-accent-500"
            )}
          >
            {meeting.audienceType}
          </Badge>
        </div>

        {meeting.audienceType === MeetingAudienceType.SPECIFIC_MEMBERS && (
          <div>
            <p className="b2-semibold">Invited Members</p>
            <div className="max-h-72 min-h-0 overflow-y-auto custom-scrollbar">
              <DataTable
                data={meeting.invitations || []}
                columns={meetingInvitationsColumns}
              />
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
