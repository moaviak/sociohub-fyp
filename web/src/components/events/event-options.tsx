import { MoreVertical } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Event, EventVisibility } from "@/types/event";
import { Link } from "react-router";

interface EventOptionsProps {
  variant?: "default" | "compact";
  event: Event;
  onDelete?: (eventId: string, societyId: string) => Promise<void>;
  isDeleting?: boolean;
}

export const EventOptions = ({
  variant,
  event,
  onDelete,
  isDeleting,
}: EventOptionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MoreVertical
          className={cn(
            "shrink-0",
            variant === "compact" ? "h-4 w-4" : "h-5 w-5"
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border border-neutral-300">
        <DropdownMenuItem className="b3-regular">
          <Link to={`/update-event/${event.id}`} state={{ event }}>
            Edit Event
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-neutral-300" />
        {event.visibility && event.visibility === EventVisibility.Draft ? (
          <DropdownMenuItem>
            <Button
              variant="ghost"
              size="inline"
              className="text-red-600"
              onClick={() => {
                if (onDelete) onDelete(event.id, event.societyId || "");
              }}
              disabled={isDeleting}
            >
              Delete Event
            </Button>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem>
            <Button variant="ghost" size="inline" className="text-red-600">
              Cancel Event
            </Button>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
