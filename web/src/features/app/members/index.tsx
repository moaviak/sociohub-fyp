import { useParams } from "react-router";

import { useAppSelector } from "@/app/hooks";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { SearchInput } from "@/components/search-input";

import { membersColumns } from "./columns";
import { useGetSocietyMembersQuery } from "./api";

const Members = () => {
  const { societyId } = useParams();
  const { user } = useAppSelector((state) => state.auth);

  let id = societyId;

  if (user && "societyId" in user) {
    id = id || user.societyId;
  }

  const { data: members, isLoading } = useGetSocietyMembersQuery({
    societyId: id || "",
  });

  if (members && "error" in members) {
    return null;
  }

  return (
    <div className="flex flex-col px-4 pt-4 min-h-0 max-h-full overflow-hidden w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-x-4 items-center">
          <p className="b1-semibold">Society Members</p>
          <Badge className="bg-primary-100/50 border-primary-400 text-primary-600">
            {members ? members.length : 0}{" "}
            {members?.length && members.length > 1 ? "members" : "member"}
          </Badge>
        </div>
        <SearchInput placeholder="Search member" className="w-xs" />
      </div>
      <div className="container mx-auto">
        <DataTable
          columns={membersColumns}
          data={members || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
export default Members;
