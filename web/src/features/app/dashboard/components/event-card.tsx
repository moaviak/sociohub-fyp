import { Skeleton } from "@/components/ui/skeleton";
import { format24To12 } from "@/lib/utils";
import { Event } from "@/types";
import { format } from "date-fns";
import { Link } from "react-router";
import { EventOptions } from "./event-options";

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  return (
    <Link to={`/event/${event.id}`}>
      <div className="flex gap-2 py-2 items-center">
        <div className="lg:w-[108px] w-[92px] rounded-md overflow-hidden aspect-[3/2]">
          <img
            src={event.banner || "/assets/images/image-placeholder.png"}
            alt="event-banner"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 flex flex-col gap-1.5 items-start">
          {event.startTime && (
            <span className="bg-secondary-600 rounded-sm py-1 px-2 text-white b4-regular">
              {format24To12(event.startTime)}
            </span>
          )}
          <p className="b2-medium text-neutral-900">{event.title}</p>
          {event.startDate && (
            <p className="b4-regular text-neutral-600">
              {format(new Date(event.startDate), "MMMM d, yyyy")}
            </p>
          )}
        </div>
        <EventOptions event={event} />
      </div>
    </Link>
  );
};

EventCard.Skeleton = function () {
  return (
    <div className="flex gap-2 py-2 items-center">
      <Skeleton className="w-[108px] h-[72px] rounded-md" />
      <div className="flex-1 flex flex-col gap-1.5 items-start">
        <Skeleton className="w-[80px] h-[20px]" />
        <Skeleton className="w-[240px] h-[20px]" />
        <Skeleton className="w-[140px] h-[20px]" />
      </div>
    </div>
  );
};
