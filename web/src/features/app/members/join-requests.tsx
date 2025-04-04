import { useParams } from "react-router";

import { useAppSelector } from "@/app/hooks";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { SearchInput } from "@/components/search-input";

import { requestsColumns } from "./columns";
import { useGetSocietyRequestsQuery } from "./api";

const JoinRequests = () => {
  const { societyId } = useParams();
  const { user } = useAppSelector((state) => state.auth);

  let id = societyId;

  if (user && "societyId" in user) {
    id = id || user.societyId;
  }

  const { data: requests, isLoading } = useGetSocietyRequestsQuery({
    societyId: id || "",
  });

  if (requests && "error" in requests) {
    return null;
  }

  return (
    <div className="flex flex-col px-4 pt-4 min-h-0 max-h-full overflow-hidden w-full">
      <div className="flex gap-x-4 items-center mb-4">
        <SearchInput placeholder="Search request" />
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
