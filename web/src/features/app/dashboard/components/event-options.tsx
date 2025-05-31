import { EventTicket } from "@/components/events/event-ticket";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Event } from "@/types";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { BookImage, CalendarCheck, MoreHorizontal } from "lucide-react";
import { Link } from "react-router";
import { useRegisterForEventMutation } from "../../events/api";
import { toast } from "sonner";
import ApiError from "@/features/api-error";

interface EventOptionsProps {
  event: Event;
}

export const EventOptions = ({ event }: EventOptionsProps) => {
  const [registerEvent, { isLoading }] = useRegisterForEventMutation();

  const onRegister = async () => {
    try {
      const response = await registerEvent(event.id).unwrap();

      if (!("error" in response)) {
        toast.success("Event successfully registered.");
      } else {
        throw new Error(response.errorMessage);
      }
    } catch (error) {
      const message =
        (error as ApiError).errorMessage ||
        (error as Error).message ||
        "Unexpected error occurred.";

      toast.error(message);
    }
  };

  return (
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
        {!event.isRegistered && (
          <DropdownMenuItem className="b3-regular">
            <Button
              variant="ghost"
              size="inline"
              className="p-0 gap-3 text-neutral-900"
              disabled={isLoading}
              onClick={onRegister}
            >
              <CalendarCheck className="w-4 h-4" />
              Register Event
            </Button>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
