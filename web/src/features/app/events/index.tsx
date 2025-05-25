import { SearchInput } from "@/components/search-input";
import { SearchFilter } from "@/components/search-filters";
import { useGetSocietyEventsQuery } from "./api";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import { useState } from "react";
import { EmptyState } from "../explore/components/empty-state";
import { EventsGrid } from "@/components/events/events-grid";
import { Event } from "@/types";

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

  if (!isLoading && (!events || "error" in events)) {
    return (
      <EmptyState
        title="No Events Found."
        label="If you believe this is an error, please try refreshing the page."
      />
    );
  }

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
          <EventsGrid.Skeleton />
        ) : (
          <EventsGrid events={events as Event[]} />
        )}
      </div>
    </div>
  );
};
