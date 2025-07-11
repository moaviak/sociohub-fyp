import { useGetEventsQuery } from "@/features/app/explore/api";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { EventCard } from "./event-card";

export const UpcomingEvents = () => {
  const { data, isLoading } = useGetEventsQuery({
    limit: 3,
    status: "Upcoming",
  });

  const events = data && !("error" in data) ? data : [];

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
        <Link to={"/explore#events"}>Explore More</Link>
      </Button>
    </div>
  );
};
