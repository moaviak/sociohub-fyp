import { EventCard } from "@/components/events/event-card";
import { useGetMyInvitesQuery, useRejectInviteMutation } from "./api";
import { EmptyState } from "../explore/components/empty-state";
import { toast } from "sonner";
import ApiError from "@/features/api-error";

export const EventsInvites = () => {
  const { data: events, isLoading } = useGetMyInvitesQuery();
  const [rejectInvite, { isLoading: isRejecting }] = useRejectInviteMutation();

  if (isLoading || !events || "error" in events) {
    return (
      <div className="w-full p-4 grid grid-cols-3 gap-4">
        <EventCard.Skeleton />
        <EventCard.Skeleton />
        <EventCard.Skeleton />
      </div>
    );
  }

  if (!isLoading && (!events || events.length === 0 || "error" in events)) {
    return (
      <EmptyState
        title="No events found."
        label="Try registering in an event."
      />
    );
  }

  const handleRejection = async (eventId: string) => {
    try {
      await rejectInvite({ eventId }).unwrap();
      toast.success("Invitation rejected.");
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "An unexpected error occurred.";
      toast.error(message);
    }
  };

  return (
    <div className="w-full p-4 grid grid-cols-3 gap-4">
      {events.map((event) => (
        <EventCard
          event={event}
          key={event.id}
          type="invited"
          onReject={handleRejection}
          isRejecting={isRejecting}
        />
      ))}
    </div>
  );
};
