import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DataTable } from "@/components/ui/data-table";
import { Meeting } from "@/types";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { meetingParticipantsColumns } from "../../columns";

export const Participants: React.FC<{ meeting: Meeting }> = ({ meeting }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between gap-4">
        <h4 className="b1-bold">Participants</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon">
            <ChevronsUpDown className="h-5 w-5" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="flex flex-col gap-2 my-2">
        <div className="max-h-72 min-h-0 overflow-y-auto custom-scrollbar">
          <DataTable
            data={meeting.participants || []}
            columns={meetingParticipantsColumns}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
