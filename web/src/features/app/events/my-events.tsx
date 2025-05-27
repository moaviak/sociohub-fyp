import { EventCard } from "@/components/events/event-card";
import { useGetMyRegistrationsQuery } from "./api";
import { EmptyState } from "../explore/components/empty-state";

export const MyEvents = () => {
  const { data: events, isLoading } = useGetMyRegistrationsQuery();

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

  return (
    <div className="w-full p-4 grid grid-cols-3 gap-4">
      {events.map((event) => (
        <EventCard event={event} key={event.id} />
      ))}
    </div>
  );
};
