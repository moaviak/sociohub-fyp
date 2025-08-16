import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { FormControl, FormControlLabel } from "@/components/ui/form-control";
import { useAssignTaskMutation } from "@/features/tasks/api";
import { Member } from "@/types";
import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import ApiError from "@/store/api-error";
import { useToastUtility } from "@/hooks/useToastUtility";

export const AssignTask = ({
  member,
  open,
  setOpen,
}: {
  member: Member;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const [value, setValue] = useState("");
  const toast = useToastUtility();

  const [assignTask, { isLoading }] = useAssignTaskMutation();

  const handleClose = () => {
    setOpen(false);
    setValue(""); // Reset form on close
    Keyboard.dismiss();
  };

  const handleSubmit = async () => {
    if (!value.trim()) {
      toast.showErrorToast("Please enter a task description");
      return;
    }

    try {
      await assignTask({
        description: value.trim(),
        memberId: member.id,
        societyId: member.societyId,
      }).unwrap();

      toast.showSuccessToast("Task assigned to member.");
      handleClose();
    } catch (error) {
      const message =
        (error as ApiError).errorMessage ||
        (error as Error).message ||
        "Unexpected error occurred. Please try again!";

      toast.showErrorToast(message);
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
        <ActionsheetContent className="pb-6">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <View className="p-6 w-full gap-y-4">
            {/* Header */}
            <View className="mb-6">
              <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Assign Task
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Assign a task to {member.firstName} {member.lastName}.
              </Text>
            </View>

            {/* Form */}
            <View className="mb-6">
              <FormControl className="mb-4">
                <FormControlLabel className="mb-2">
                  <Text className="text-sm font-medium text-gray-900 dark:text-white">
                    Task Description
                  </Text>
                </FormControlLabel>
                <Input className="h-12">
                  <InputField
                    value={value}
                    onChangeText={setValue}
                    placeholder="Enter a task description to assign"
                    multiline={false}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                </Input>
              </FormControl>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onPress={handleClose}
                disabled={isLoading}
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button
                className="flex-1"
                onPress={handleSubmit}
                isDisabled={isLoading || !value.trim()}
              >
                <ButtonText>{isLoading ? "Assigning..." : "Assign"}</ButtonText>
              </Button>
            </View>
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </KeyboardAvoidingView>
  );
};
