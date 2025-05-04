import { UseFormReturn } from "react-hook-form";
import { useGetSocietyMembersQuery } from "../api";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import { SearchInput } from "@/components/search-input";
import { DataTable } from "@/components/ui/data-table";
import { rolesMemberColumns } from "../columns";
import { Member } from "@/types";
import { useMemo } from "react";

interface RolesFormMembersProps {
  form: UseFormReturn<
    {
      name: string;
      minSemester?: number | undefined;
      description?: string | undefined;
      privileges?: string[] | undefined;
      members?: string[] | undefined;
    },
    undefined
  >;
}

export const RolesFormMembers = ({ form }: RolesFormMembersProps) => {
  const societyId = useGetSocietyId();

  const { data: members, isLoading } = useGetSocietyMembersQuery({
    societyId: societyId || "",
  });

  // Get the current member IDs from the form
  const selectedMemberIds = useMemo(() => form.watch("members") || [], [form]);

  // Prepare initialRowSelection with pre-selected rows
  const initialRowSelection = useMemo(() => {
    if (
      !members ||
      "error" in members ||
      members.length === 0 ||
      selectedMemberIds.length === 0
    ) {
      return {};
    }

    // Create a record of row indices that should be selected
    const selection: Record<string, boolean> = {};

    members.forEach((member, index) => {
      if (selectedMemberIds.includes(member.id)) {
        selection[index] = true;
      }
    });

    return selection;
  }, [members, selectedMemberIds]);

  if (members && "error" in members) {
    return null;
  }

  const handleRowSelectionChange = (selectedRows: Member[]) => {
    // Directly update the form with selected member IDs
    const memberIds = selectedRows.map((row) => row.id);
    form.setValue("members", memberIds, { shouldDirty: true });
  };

  return (
    <div className="space-y-2">
      <h5 className="b1-medium">Assign this role to members.</h5>
      <SearchInput placeholder="Search member" />

      <div className="min-h-[320px] max-h-[320px] overflow-y-auto">
        <DataTable
          columns={rolesMemberColumns}
          data={members || []}
          isLoading={isLoading}
          onRowSelectionChange={handleRowSelectionChange}
          initialRowSelection={initialRowSelection}
        />
      </div>
    </div>
  );
};
