import useGetSocietyId from "@/hooks/useGetSocietyId";
import { DataTable } from "@/components/ui/data-table";
import { SearchInput } from "@/components/search-input";

import { requestsHistoryColumns } from "./columns";
import { useGetRequestsHistoryQuery } from "./api";
import { useDebounceCallback } from "usehooks-ts";
import { useState } from "react";

export const RequestsHistory = () => {
  const societyId = useGetSocietyId();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSetSearch = useDebounceCallback(setSearch, 300);

  const {
    data: requests,
    isLoading,
    isFetching,
  } = useGetRequestsHistoryQuery({
    societyId: societyId || "",
    search,
  });

  if (requests && "error" in requests) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  return (
    <div className="flex flex-col px-4 pt-4 min-h-0 max-h-full overflow-hidden w-full">
      <div className="flex gap-x-4 items-center mb-4">
        <SearchInput
          placeholder="Search request"
          value={input}
          onChange={handleInputChange}
          isSearching={!isLoading && isFetching}
        />
      </div>
      <div className="container mx-auto">
        <DataTable
          columns={requestsHistoryColumns}
          data={requests || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
