import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";

import { ROLES_PRIVILEGES } from "@/data";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface RolesFormPrivilegesProps {
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

export const RolesFormPrivileges = ({ form }: RolesFormPrivilegesProps) => {
  const { watch, setValue } = form;
  const selectedPrivileges = watch("privileges");

  useEffect(() => {
    // Initialize privileges array if it's not already set
    if (!selectedPrivileges || !Array.isArray(selectedPrivileges)) {
      setValue("privileges", []);
    }
  }, [selectedPrivileges, setValue]);

  const togglePrivilege = (key: string) => {
    const currentPrivileges = [...(selectedPrivileges || [])];

    if (currentPrivileges.includes(key)) {
      // Remove privilege if already selected
      setValue(
        "privileges",
        currentPrivileges.filter((privilege) => privilege !== key)
      );
    } else {
      // Add privilege if not selected
      setValue("privileges", [...currentPrivileges, key]);
    }
  };

  return (
    <div className="space-y-2">
      <h5 className="b1-medium">Assign privileges to the role.</h5>

      <div>
        {ROLES_PRIVILEGES.map((privilege) => {
          const isSelected = selectedPrivileges?.includes(privilege.key);

          return (
            <label
              key={privilege.key}
              className={cn(
                "flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors",
                isSelected
                  ? "border-primary-600 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <Checkbox
                id={privilege.key}
                checked={isSelected}
                onCheckedChange={() => togglePrivilege(privilege.key)}
                className="h-5 w-5 border-gray-300 data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex-1">
                <h4 className="b2-medium">{privilege.title}</h4>
                <p className="b3-regular text-muted-foreground">
                  {privilege.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};
