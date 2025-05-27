import { EventCard } from "@/components/events/event-card";
import { useGetMyRegistrationsQuery } from "./api";

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

  return (
    <div className="w-full p-4 grid grid-cols-3 gap-4">
      {events.map((event) => (
        <EventCard event={event} key={event.id} />
      ))}
    </div>
  );
};
