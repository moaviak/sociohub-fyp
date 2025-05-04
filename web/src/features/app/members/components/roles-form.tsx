import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { Role } from "@/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ApiError from "@/features/api-error";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { RolesFormSchema, RolesFormValues } from "@/schema";

import { RolesFormBasic } from "./roles-form-basic";
import { RolesFormPrivileges } from "./roles-form-privileges";
import { RolesFormMembers } from "./roles-form-members";
import { useCreateRoleMutation, useUpdateRoleMutation } from "../api";
import useGetSocietyId from "@/hooks/useGetSocietyId";

interface RolesFormProps {
  role?: Role;
  children: React.ReactNode;
}

export const RolesForm = ({ role, children }: RolesFormProps) => {
  const [step, setStep] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const totalSteps = 3;

  const societyId = useGetSocietyId();

  const [createRole, { isError, error, isLoading }] = useCreateRoleMutation();
  const [
    updateRole,
    { isError: isUpdateError, error: updateError, isLoading: isUpdating },
  ] = useUpdateRoleMutation();

  const form = useForm<RolesFormValues>({
    resolver: zodResolver(RolesFormSchema),
    defaultValues: {
      name: "",
      description: "",
      privileges: [],
      members: [],
    },
  });

  // Reset form with the latest role data when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Reset form to initial state first
      form.reset({
        name: "",
        description: "",
        minSemester: undefined,
        privileges: [],
        members: [],
      });

      // Then apply role data if editing
      if (role) {
        const minSemester =
          role.minSemester !== null &&
          role.minSemester !== undefined &&
          !isNaN(Number(role.minSemester))
            ? Number(role.minSemester)
            : undefined;

        form.reset({
          name: role.name,
          description: role.description ?? "",
          minSemester,
          privileges: role.privileges ?? [],
          members: role.assignedMembers?.map((member) => member.id) ?? [],
        });
      }
    }
  }, [isOpen, role, form]);

  const onSubmit = async (values: RolesFormValues) => {
    // Ensure minSemester is a valid number or undefined before submitting
    const processedValues = {
      ...values,
      minSemester:
        values.minSemester !== undefined && !isNaN(Number(values.minSemester))
          ? Number(values.minSemester)
          : undefined,
    };

    if (step === totalSteps) {
      const response = !role
        ? await createRole({
            societyId: societyId || "",
            ...processedValues,
          })
        : await updateRole({
            societyId: societyId || "",
            roleId: role.id,
            ...processedValues,
          });

      if (!("error" in response)) {
        if (role) {
          toast.success("Role has been successfully updated.");
        } else {
          toast.success("Role has been successfully created.");
        }
        form.reset();
        setStep(1);
        setIsOpen(false);
      }
    } else {
      // Move to the next step
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const isNextButtonDisabled = () => {
    const privileges = form.watch("privileges");
    return step === 2 && (!privileges || privileges.length === 0);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <RolesFormBasic form={form} />;
      case 2:
        return <RolesFormPrivileges form={form} />;
      case 3:
        return <RolesFormMembers form={form} />;
      default:
        return null;
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
    if (isUpdateError) {
      toast.error(
        (updateError as ApiError)?.errorMessage ||
          "An unexpected error occurred",
        {
          duration: 10000,
        }
      );
    }
  }, [isError, error, isUpdateError, updateError]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary-600 h5-semibold">
            {role ? "Edit" : "Create"} Role
          </DialogTitle>
          <DialogDescription>
            {role
              ? "Modify the details of the existing role."
              : "Provide the necessary information to create a new role."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {renderStepContent()}
            <DialogFooter className="flex justify-between w-full pt-4">
              <div>
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isNextButtonDisabled() || isLoading || isUpdating}
                >
                  {step === totalSteps ? "Submit" : "Next"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
