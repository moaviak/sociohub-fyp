import { SearchInput } from "@/components/search-input";
import { SearchFilter } from "@/components/search-filters";
import { useDeleteEventMutation, useGetSocietyEventsQuery } from "./api";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import { useEffect, useState } from "react";
import { EmptyState } from "../explore/components/empty-state";
import { Event } from "@/types";
import { EventCard } from "@/components/events/event-card";
import { toast } from "sonner";

export const Events = () => {
  const societyId = useGetSocietyId();
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    categories: [] as string[],
  });

  const { data: events, isFetching: isLoading } = useGetSocietyEventsQuery({
    societyId: societyId || "",
    status: filters.status || "",
    categories: filters.categories.join(","),
  });
  const [deleteEvent, { isLoading: isDeleting, isError: isDeleteError }] =
    useDeleteEventMutation();

  useEffect(() => {
    if (isDeleteError) {
      toast.error(
        "Unexpected error occurred while deleting. Please try again!"
      );
    }
  }, [isDeleteError]);

  if (!isLoading && (!events || "error" in events)) {
    return (
      <EmptyState
        title="No Events Found."
        label="If you believe this is an error, please try refreshing the page."
      />
    );
  }

  const onDelete = async (eventId: string, societyId: string) => {
    const response = await deleteEvent({ eventId, societyId });

    if (!("error" in response)) {
      toast.success("Event successfully deleted.");
    }
  };

  return (
    <div className="flex flex-col px-4 pt-4 w-full">
      {" "}
      <div className="flex gap-x-4 py-2">
        <SearchInput placeholder="Search Events" />
        <SearchFilter
          onFilterChange={(filters) =>
            setFilters({
              status: filters.status ?? undefined,
              categories: filters.categories as string[],
            })
          }
        />
      </div>
      <div className="w-full p-4">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            <EventCard.Skeleton />
            <EventCard.Skeleton />
            <EventCard.Skeleton />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {(events as Event[]).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onDelete={onDelete}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
