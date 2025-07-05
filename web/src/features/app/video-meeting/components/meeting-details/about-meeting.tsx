import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Meeting } from "@/types";
import { ChevronsUpDown } from "lucide-react";
import React, { useState } from "react";

export const AboutMeeting: React.FC<{ meeting: Meeting }> = ({ meeting }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between gap-4">
        <h4 className="b1-bold">About This Meeting</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon">
            <ChevronsUpDown className="h-5 w-5" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="flex flex-col gap-2 my-2">
        <div className="bg-neutral-200 b3-regular w-full h-20 max-h-24 p-2 rounded-md overflow-y-auto custom-scrollbar">
          {meeting.description || "N/A"}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
