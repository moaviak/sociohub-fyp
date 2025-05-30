import { Delete, Edit, MoreVertical, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Event, EventStatus, EventVisibility } from "@/types/event";
import { Link } from "react-router";
import { useCancelEventMutation } from "@/features/app/events/api";
import { useEffect } from "react";
import { toast } from "sonner";
import { EventTicket } from "./event-ticket";

interface EventOptionsProps {
  variant?: "default" | "compact";
  event: Event;
  onDelete?: (eventId: string, societyId: string) => Promise<void>;
  isDeleting?: boolean;
  havePrivilege?: boolean;
}

export const EventOptions = ({
  variant,
  event,
  onDelete,
  isDeleting,
  havePrivilege,
}: EventOptionsProps) => {
  const [cancelEvent, { isLoading, isError }] = useCancelEventMutation();

  useEffect(() => {
    if (isError) {
      toast.error(
        "An Error occurred while cancelling the event. Please try again!"
      );
    }
  }, [isError]);

  const handleCancel = async () => {
    const response = await cancelEvent({
      eventId: event.id,
      societyId: event.societyId || "",
    });

    if (!("error" in response)) {
      toast.success("Event successfully cancelled.");
    }
  };

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
        {event.isRegistered && event.registration?.ticket && (
          <DropdownMenuItem
            className="b3-regular"
            onSelect={(e) => e.preventDefault()}
          >
            <EventTicket event={event} ticket={event.registration.ticket} />
          </DropdownMenuItem>
        )}
        {havePrivilege &&
          event.status !== EventStatus.Cancelled &&
          event.status !== EventStatus.Completed && (
            <DropdownMenuItem className="b3-regular">
              <Link
                to={`/update-event/${event.id}`}
                state={{ event }}
                className="flex items-center gap-3"
              >
                <Edit className="h-4 w-4" />
                Edit Event
              </Link>
            </DropdownMenuItem>
          )}
        {havePrivilege && (
          <>
            <DropdownMenuSeparator className="bg-neutral-300" />
            {event.visibility &&
            event.visibility === EventVisibility.Draft &&
            event.status === EventStatus.Completed ? (
              <DropdownMenuItem>
                <Button
                  variant="ghost"
                  size="inline"
                  className="text-red-600 p-0 group"
                  onClick={() => {
                    if (onDelete) onDelete(event.id, event.societyId || "");
                  }}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 text-red-500 group-hover:text-accent-foreground transition-colors" />
                  Delete Event
                </Button>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem>
                <Button
                  variant="ghost"
                  size="inline"
                  className="text-red-600 p-0 group"
                  onClick={handleCancel}
                  disabled={isLoading || event.status === EventStatus.Cancelled}
                >
                  <Delete className="h-4 w-4 text-red-500 group-hover:text-accent-foreground transition-colors" />
                  Cancel Event
                </Button>
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
