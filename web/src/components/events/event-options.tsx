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
import { Event } from "@/types/event";
import { Link, useLocation } from "react-router";

interface EventOptionsProps {
  variant?: "default" | "compact";
  event: Event;
}

export const EventOptions = ({ variant, event }: EventOptionsProps) => {
  const location = useLocation();

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
      <DropdownMenuContent className="border border-neutral-300">
        <DropdownMenuItem className="b3-regular">
          <Link
            to={`${location.pathname}/update-event/${event.id}`}
            state={{ event }}
          >
            Edit Event
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-neutral-300" />
        <DropdownMenuItem>
          <Button variant="ghost" size="inline" className="text-red-600">
            Delete
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
