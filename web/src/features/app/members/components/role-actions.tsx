import { Pencil, Trash2 } from "lucide-react";

import { Role } from "@/types";
import { Button } from "@/components/ui/button";
import { useDeleteRoleMutation } from "../api";
import { RolesForm } from "./roles-form";
import { useEffect } from "react";
import { toast } from "sonner";
import ApiError from "@/features/api-error";
import useGetSocietyId from "@/hooks/useGetSocietyId";

interface RoleActionsProps {
  role: Role;
}

export const RoleActions = ({ role }: RoleActionsProps) => {
  const societyId = useGetSocietyId() || "";
  const [deleteRole, { isLoading, isError, error }] = useDeleteRoleMutation();

  const onDelete = async () => {
    const response = await deleteRole({ societyId, roleId: role.id });

    if (!("error" in response)) {
      toast.success("Role successfully deleted.");
    }
  };

  useEffect(() => {
    if (isError) {
      toast.error(
        (error as ApiError)?.errorMessage || "An unexpected error occurred",
        {
          duration: 10000,
        }
      );
    }
  }, [isError, error]);

  return (
    <div>
      <RolesForm role={role}>
        <Button variant="ghost" size="icon">
          <Pencil className="text-primary-600 w-5 h-5" />
        </Button>
      </RolesForm>
      <Button
        variant="ghost"
        size="icon"
        disabled={isLoading}
        onClick={onDelete}
      >
        <Trash2 className="text-red-500 w-5 h-5" />
      </Button>
    </div>
  );
};
