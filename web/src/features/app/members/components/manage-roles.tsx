import { Member } from "@/types";
import { useEffect, useState } from "react";
import { useAssignRolesMutation, useGetSocietyRolesQuery } from "../api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface ManageRolesProps {
  member: Member;
  onClose?: () => void;
}

export const ManageRoles = ({ member, onClose }: ManageRolesProps) => {
  const [roles, setRoles] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(onClose ? true : false);

  const { data: societyRoles, isLoading: isFetching } = useGetSocietyRolesQuery(
    {
      societyId: member.societyId,
    }
  );
  const [assignRoles, { isLoading, isError }] = useAssignRolesMutation();

  // Force dialog to be open when component mounts if it's being controlled externally
  useEffect(() => {
    if (onClose) {
      setIsOpen(true);
    }
  }, [onClose]);

  useEffect(() => {
    if (member.roles) {
      setRoles(member.roles.map((role) => role.id));
    }
  }, [member.roles]);

  useEffect(() => {
    if (isError) {
      toast.error(
        "An unexpected error occurred while updating roles. Please try again."
      );
    }
  }, [isError]);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen && member.roles) {
      setRoles(member.roles.map((role) => role.id));
    }
  }, [isOpen, member.roles]);

  if (societyRoles && "error" in societyRoles) {
    return null;
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form state on close
      if (member.roles) {
        setRoles(member.roles.map((role) => role.id));
      }

      // Notify parent component
      if (onClose) {
        // Use requestAnimationFrame to ensure the state is updated before unmounting
        requestAnimationFrame(() => {
          onClose();
        });
      }
    }
  };

  const toggleRole = (roleId: string) => {
    const currentRoles = [...roles];

    if (currentRoles.includes(roleId)) {
      // Remove role if already selected
      setRoles(currentRoles.filter((role) => role !== roleId));
    } else {
      setRoles([...currentRoles, roleId]);
    }
  };

  const handleSubmit = async () => {
    const response = await assignRoles({
      societyId: member.societyId,
      studentId: member.id,
      roleIds: roles,
    });

    if (response && !("error" in response)) {
      toast.success(
        `Roles updated successfully for ${member.firstName} ${member.lastName}`
      );
      setIsOpen(false);
      if (onClose) onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} modal={true}>
      {!onClose && (
        <DialogTrigger asChild>
          <p className="cursor-pointer b3-regular">Manage Roles</p>
        </DialogTrigger>
      )}
      <DialogContent
        className="sm:max-w-2xl flex flex-col min-h-0 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onPointerDownCapture={(e) => e.stopPropagation()}
        onInteractOutside={(e) => {
          e.preventDefault();
          handleOpenChange(false);
        }}
      >
        <DialogHeader className="px-4">
          <DialogTitle className="text-primary-600 h5-semibold">
            Manage Member Roles
          </DialogTitle>
          <DialogDescription>
            Assign or Unassign roles to the member. You can select multiple
            roles.
          </DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <ManageRolesSkeleton />
        ) : (
          <div className="overflow-y-auto custom-scrollbar py-2">
            {societyRoles?.map((role) => {
              const isSelected = roles.includes(role.id);

              return (
                <label
                  key={role.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors",
                    isSelected
                      ? "border-primary-600 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    id={role.id}
                    checked={isSelected}
                    onCheckedChange={() => toggleRole(role.id)}
                    className="h-5 w-5 border-gray-300 data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <h4 className="b2-medium">{role.name}</h4>
                    <p className="b3-regular text-muted-foreground line-clamp-1">
                      {role.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
        <DialogFooter className="my-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} onClick={handleSubmit}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function ManageRolesSkeleton() {
  return (
    <div className="flex flex-col gap-y-4 px-4 py-2">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}
