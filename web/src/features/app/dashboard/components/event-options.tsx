import { EventTicket } from "@/components/events/event-ticket";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Event } from "@/types";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { BookImage, MoreHorizontal } from "lucide-react";
import { Link } from "react-router";

interface EventOptionsProps {
  event: Event;
}

export const EventOptions = ({ event }: EventOptionsProps) => {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger onClick={(e) => e.preventDefault()} asChild>
          <MoreHorizontal className="w-5 h-5 text-neutral-600" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border border-neutral-300">
          <DropdownMenuItem className="b3-regular">
            <Link to={`/event/${event.id}`} className="flex items-center gap-3">
              <BookImage className="w-4 h-4" />
              View Detail
            </Link>
          </DropdownMenuItem>
          {event.isRegistered && event.registration?.ticket && (
            <DropdownMenuItem
              className="b3-regular"
              onSelect={(e) => e.preventDefault()}
            >
              <EventTicket event={event} ticket={event.registration.ticket} />
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
