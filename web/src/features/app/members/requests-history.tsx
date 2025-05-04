import useGetSocietyId from "@/hooks/useGetSocietyId";
import { DataTable } from "@/components/ui/data-table";
import { SearchInput } from "@/components/search-input";

import { requestsHistoryColumns } from "./columns";
import { useGetRequestsHistoryQuery } from "./api";

export const RequestsHistory = () => {
  const societyId = useGetSocietyId();

  const { data: requests, isLoading } = useGetRequestsHistoryQuery({
    societyId: societyId || "",
  });

  if (requests && "error" in requests) {
    return null;
  }

  return (
    <div className="flex flex-col px-4 pt-4 min-h-0 max-h-full overflow-hidden w-full">
      <div className="flex gap-x-4 items-center mb-4">
        <SearchInput placeholder="Search request" />
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
