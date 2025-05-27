import { SearchInput } from "@/components/search-input";
import { SearchFilter } from "@/components/search-filters";
import { useEffect, useState } from "react";
import { EmptyState } from "../explore/components/empty-state";
import { Event } from "@/types";
import { useGetEventsQuery } from "./api";
import { EventCard } from "@/components/events/event-card";
import {
  useDeleteEventMutation,
  useRegisterForEventMutation,
} from "../events/api";
import { toast } from "sonner";
import { useDebounceCallback } from "usehooks-ts";

const Events = () => {
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    categories: [] as string[],
  });
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSetSearch = useDebounceCallback(setSearch, 300);

  const {
    data: events,
    isFetching,
    isLoading,
  } = useGetEventsQuery({
    search: search || "",
    status: filters.status || "",
    categories: filters.categories.join(","),
  });
  const [registerForEvent, { isLoading: isRegistering, isError }] =
    useRegisterForEventMutation();
  const [deleteEvent, { isLoading: isDeleting, isError: isDeleteError }] =
    useDeleteEventMutation();

  useEffect(() => {
    if (isError) {
      toast.error(
        "An unexpected error occurred when registering. Please try again!"
      );
    }

    if (isDeleteError) {
      toast.error(
        "Unexpected error occurred while deleting. Please try again!"
      );
    }
  }, [isError, isDeleteError]);

  if (!isLoading && (!events || "error" in events)) {
    return (
      <EmptyState
        title="No Events Found."
        label="If you believe this is an error, please try refreshing the page."
      />
    );
  }

  const onRegister = async (eventId: string) => {
    const response = await registerForEvent(eventId);

    if (!("error" in response)) {
      toast.success("You have been successfully registered for event.");
    }
  };

  const onDelete = async (eventId: string, societyId: string) => {
    const response = await deleteEvent({ eventId, societyId });

    if (!("error" in response)) {
      toast.success("Event successfully deleted.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  return (
    <div className="flex flex-col px-4 pt-4 w-full">
      {" "}
      <div className="flex gap-x-4 py-2">
        <SearchInput
          placeholder="Search Events"
          value={input}
          onChange={handleInputChange}
          isSearching={!isLoading && isFetching}
        />
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
                isRegistering={isRegistering}
                onRegister={onRegister}
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

export default Events;
