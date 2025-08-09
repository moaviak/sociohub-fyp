import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Toast, ToastDescription, useToast } from "@/components/ui/toast";
import { Role } from "@/types";
import {
  View,
  Text,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useCreateRoleMutation, useUpdateRoleMutation } from "./api";
import { useForm } from "react-hook-form";
import { RolesFormSchema, RolesFormValues } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import ApiError from "@/store/api-error";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import { HStack } from "@/components/ui/hstack";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react-native";
import { RoleFormBasic } from "./components/roles-form-basic";
import { RoleFormPrivileges } from "./components/roles-form-privileges";
import { RoleFormMembers } from "./components/roles-form-members";

export const RoleForm = ({
  role,
  open,
  setOpen,
}: {
  role?: Role;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const toast = useToast();
  const societyId = useGetSocietyId();

  const [createRole, { isLoading }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

  const form = useForm({
    resolver: zodResolver(RolesFormSchema),
    defaultValues: {
      name: "",
      description: "",
      privileges: [],
      members: [],
    },
  });

  // Reset form when dialog opens/closes or role changes
  useEffect(() => {
    if (open) {
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
      setStep(1); // Reset to first step when opening
    }
  }, [open, role, form]);

  const handleClose = () => {
    setOpen(false);
    setStep(1);
    Keyboard.dismiss();
  };

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
      try {
        !role
          ? await createRole({
              societyId: societyId || "",
              ...processedValues,
            }).unwrap()
          : await updateRole({
              societyId: societyId || "",
              roleId: role.id,
              ...processedValues,
            }).unwrap();

        toast.show({
          duration: 5000,
          placement: "top",
          containerStyle: {
            marginTop: 18,
          },
          render: () => (
            <Toast action="success">
              <ToastDescription>
                {role
                  ? "Role has been successfully updated."
                  : "Role has been successfully created."}
              </ToastDescription>
            </Toast>
          ),
        });

        form.reset();
        setStep(1);
        setOpen(false);
      } catch (error) {
        const message = (error as ApiError).errorMessage;
        toast.show({
          duration: 10000,
          placement: "top",
          containerStyle: {
            marginTop: 18,
          },
          render: () => (
            <Toast action="error">
              <ToastDescription>
                {message || "An unexpected error occurred"}
              </ToastDescription>
            </Toast>
          ),
        });
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

  const renderStepIndicator = () => (
    <HStack className="justify-center items-center mb-6" space="sm">
      {[1, 2, 3].map((stepNumber) => (
        <View key={stepNumber} className="flex-row items-center">
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              stepNumber <= step ? "bg-primary-500" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                stepNumber <= step ? "text-white" : "text-gray-500"
              }`}
            >
              {stepNumber}
            </Text>
          </View>
          {stepNumber < 3 && (
            <View
              className={`w-8 h-0.5 mx-1 ${
                stepNumber < step ? "bg-primary-500" : "bg-gray-200"
              }`}
            />
          )}
        </View>
      ))}
    </HStack>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <RoleFormBasic form={form} />;
      case 2:
        return <RoleFormPrivileges form={form} />;
      case 3:
        return <RoleFormMembers form={form} societyId={societyId} />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Basic Information";
      case 2:
        return "Privileges";
      case 3:
        return "Assign Members";
      default:
        return "";
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="position"
      style={{
        position: "relative",
        flex: 1,
        justifyContent: "flex-end",
      }}
    >
      <Actionsheet isOpen={open} onClose={handleClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="pb-6 max-h-[90%]">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <VStack className="w-full px-4 py-4" space="lg">
            {/* Header */}
            <VStack space="sm">
              <Text className="text-xl font-semibold text-center text-gray-800">
                {role ? "Edit" : "Create"} Role
              </Text>
              <Text className="text-sm text-gray-600 text-center">
                {role
                  ? "Modify the details of the existing role."
                  : "Provide the necessary information to create a new role."}
              </Text>
            </VStack>

            {/* Step Indicator */}
            {renderStepIndicator()}

            {/* Step Title */}
            <Text className="text-lg font-medium text-center text-gray-800">
              {getStepTitle()}
            </Text>

            {/* Form Content */}
            <View>{renderStepContent()}</View>

            {/* Navigation Buttons */}
            <HStack className="justify-between items-center mt-4" space="md">
              <View className="flex-1">
                {step > 1 ? (
                  <Button
                    variant="outline"
                    onPress={handleBack}
                    className="flex-row items-center justify-center"
                  >
                    <Icon
                      as={ArrowLeftIcon}
                      className="mr-1 text-primary-500"
                    />
                    <ButtonText>Back</ButtonText>
                  </Button>
                ) : (
                  <View />
                )}
              </View>

              <Button variant="outline" onPress={handleClose} className="mx-2">
                <ButtonText>Cancel</ButtonText>
              </Button>

              <View className="flex-1">
                <Button
                  onPress={form.handleSubmit(onSubmit)}
                  isDisabled={isNextButtonDisabled() || isLoading || isUpdating}
                  className="bg-primary-500 flex-row items-center justify-center"
                >
                  {isLoading || isUpdating ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <ButtonText className="text-white">
                        {step === totalSteps ? "Submit" : "Next"}
                      </ButtonText>
                      {step < totalSteps && (
                        <Icon
                          as={ArrowRightIcon}
                          color="white"
                          className="ml-1"
                        />
                      )}
                    </>
                  )}
                </Button>
              </View>
            </HStack>
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </KeyboardAvoidingView>
  );
};
