import { useGetEventsQuery } from "@/features/app/explore/api";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { EventCard } from "./event-card";
import { useGetSocietyEventsQuery } from "../../events/api";

export const UpcomingEvents = ({ societyId }: { societyId?: string }) => {
  const { data: studentEvents, isLoading } = useGetEventsQuery(
    {
      limit: 3,
      status: "Upcoming",
    },
    { skip: !!societyId }
  );

  const { data: societyEvents } = useGetSocietyEventsQuery({
    societyId: societyId || "",
    status: "Upcoming",
  });

  const events = (societyId ? societyEvents : studentEvents) || [];

  return (
    <div className="w-full flex flex-col gap-y-4 p-4 bg-white drop-shadow-lg rounded-lg min-h-[448px]">
      <h5 className="h6-semibold">Upcoming Events</h5>
      <div className="flex-1">
        {isLoading ? (
          <>
            <EventCard.Skeleton />
            <EventCard.Skeleton />
            <EventCard.Skeleton />
          </>
        ) : events.length > 0 ? (
          events.map((event) => <EventCard key={event.id} event={event} />)
        ) : (
          <div className="flex items-center justify-center">
            <p className="b3-regular">No Upcoming Events</p>
          </div>
        )}
      </div>
      <Button variant={"outline"} asChild>
        {!societyId ? (
          <Link to={"/explore#events"}>Explore More</Link>
        ) : (
          <Link to={`/events/${societyId}`}>View All</Link>
        )}
      </Button>
    </div>
  );
};
