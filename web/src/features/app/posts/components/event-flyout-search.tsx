import { SearchInput } from "@/components/search-input";
import { Event } from "@/types";
import { useGetSocietyEventsInfiniteQuery } from "../../events/api";
import { useDebounceCallback } from "usehooks-ts";
import { useState } from "react";
import { formatEventDateTime } from "@/lib/utils";

export const EventFlyoutSearch = ({
  societyId,
  onSelect,
}: {
  societyId: string;
  onSelect: (event: Event) => void;
}) => {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSetSearch = useDebounceCallback(setSearch, 300);

  const { data, isFetching } = useGetSocietyEventsInfiniteQuery(
    {
      societyId: societyId || "",
      search,
      status: "Past",
    },
    { skip: !search }
  );

  const events =
    data?.pages.flat().flatMap((response) => response.events) ?? [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  return (
    <div className="w-full relative">
      <SearchInput
        placeholder="Search for an event..."
        className="w-full"
        value={input}
        onChange={handleInputChange}
        isSearching={isFetching}
      />
      {search && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
          {isFetching ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Searching...
            </div>
          ) : !events || events.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No results found
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => onSelect(event)}
              >
                <p className="b2-medium">{event.title}</p>
                <p className="b4-regular">
                  {formatEventDateTime(
                    event.startDate!,
                    event.endDate!,
                    event.startTime!,
                    event.endTime!
                  )}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
