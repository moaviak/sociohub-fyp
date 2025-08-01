import { DataTable } from "@/components/ui/data-table";

import { Button } from "@/components/ui/button";
import useGetSocietyId from "@/hooks/useGetSocietyId";

import { rolesColumns } from "./columns";
import { useGetSocietyRolesQuery } from "./api";
import { RolesForm } from "./components/roles-form";

const Roles = () => {
  const societyId = useGetSocietyId();

  const { data: roles, isLoading } = useGetSocietyRolesQuery({
    societyId: societyId || "",
  });

  if (roles && "error" in roles) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex justify-between">
        <div>
          <h4 className="h4-semibold">Manage Roles</h4>
          <p className="b3-regular">
            View and Manage existing roles for the society.
          </p>
        </div>

        <RolesForm>
          <Button>Create New Role</Button>
        </RolesForm>
      </div>

      <div className="">
        <DataTable
          columns={rolesColumns}
          data={roles || []}
          isLoading={isLoading}
          disableInternalPagination
        />
      </div>
    </div>
  );
};
export default Roles;
