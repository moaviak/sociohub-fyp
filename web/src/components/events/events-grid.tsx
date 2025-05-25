import { Event } from "@/types";
import { EventCard } from "./event-card";

interface EventsGridProps {
  events: Event[];
}

export const EventsGrid = ({ events }: EventsGridProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

EventsGrid.Skeleton = function EventsGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <EventCard.Skeleton />
      <EventCard.Skeleton />
      <EventCard.Skeleton />
    </div>
  );
};
