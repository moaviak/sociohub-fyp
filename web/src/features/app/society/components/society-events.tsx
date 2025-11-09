import { Society } from "@/types";
import {
  useDeleteEventMutation,
  useGetSocietyEventsInfiniteQuery,
} from "../../events/api";
import { EventCard } from "@/components/events/event-card";
import { toast } from "sonner";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface SocietyEventsProps {
  society: Society;
}

export const SocietyEvents = ({ society }: SocietyEventsProps) => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetSocietyEventsInfiniteQuery({
      societyId: society.id,
      limit: 10,
      page: 1,
    });
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

  const events =
    data?.pages.flat().flatMap((response) => response.events) ?? [];

  const { ref: loaderRef, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  // Fetch next page when loader in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
        <>
          <div className="grid grid-cols-3 gap-4">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onDelete={onDelete}
                isDeleting={isDeleting}
              />
            ))}
          </div>
          {/* Loader for infinite scroll */}
          {hasNextPage && (
            <div ref={loaderRef} className="w-full py-4">
              <Loader2 className="mx-auto animate-spin text-neutral-600 w-6 h-6" />
            </div>
          )}
        </>
      )}
    </div>
  );
};
