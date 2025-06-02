import { Society } from "@/types";
import {
  useDeleteEventMutation,
  useGetSocietyEventsQuery,
  useRegisterForEventMutation,
} from "../../events/api";
import { EventCard } from "@/components/events/event-card";
import { toast } from "sonner";

interface SocietyEventsProps {
  society: Society;
}

export const SocietyEvents = ({ society }: SocietyEventsProps) => {
  const { data, isLoading } = useGetSocietyEventsQuery({
    societyId: society.id,
  });
  const [registerForEvent, { isLoading: isRegistering }] =
    useRegisterForEventMutation();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

  const events = data && !("error" in data) ? data : [];

  const onRegister = async (eventId: string) => {
    const response = await registerForEvent(eventId);

    if (!("error" in response)) {
      toast.success("You have been successfully registered for event.");
    } else {
      toast.error("An unexpected error occurred, please try again!");
    }
  };

  const onDelete = async (eventId: string, societyId: string) => {
    const response = await deleteEvent({ eventId, societyId });

    if (!("error" in response)) {
      toast.success("Event successfully deleted.");
    } else {
      toast.error("An unexpected error occurred, please try again!");
    }
  };

  return (
    <div className="w-full p-4">
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          <EventCard.Skeleton />
          <EventCard.Skeleton />
          <EventCard.Skeleton />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isRegistering={isRegistering}
              onRegister={onRegister}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  );
};
