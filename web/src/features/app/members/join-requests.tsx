import { Badge } from "@/components/ui/badge";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import { DataTable } from "@/components/ui/data-table";
import { SearchInput } from "@/components/search-input";

import { requestsColumns } from "./columns";
import { useGetSocietyRequestsQuery } from "./api";
import { useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

const JoinRequests = () => {
  const societyId = useGetSocietyId();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSetSearch = useDebounceCallback(setSearch, 300);

  const {
    data: requests,
    isFetching,
    isLoading,
  } = useGetSocietyRequestsQuery({
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
        <Badge className="bg-secondary-100 border-secondary-400 text-secondary-600">
          {requests ? requests.length : 0} requests
        </Badge>
      </div>
      <div className="container mx-auto">
        <DataTable
          columns={requestsColumns}
          data={requests || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default JoinRequests;
