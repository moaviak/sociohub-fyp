import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Member } from "@/types";
import {
  KeyboardAvoidingView,
  Keyboard,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRemoveMemberMutation } from "../api";
import { REMOVAL_REASONS } from "@/data";
import { useState, useEffect } from "react";
import ApiError from "@/store/api-error";
import { useToastUtility } from "@/hooks/useToastUtility";

export const RemoveMember = ({
  member,
  open,
  setOpen,
}: {
  member: Member;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [formError, setFormError] = useState("");

  const toast = useToastUtility();

  const [removeMember, { isLoading }] = useRemoveMemberMutation();

  // Update selected reason based on selection
  useEffect(() => {
    if (selectedValue === "Other") {
      setSelectedReason(otherReason);
    } else {
      setSelectedReason(selectedValue);
    }
  }, [selectedValue, otherReason]);

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      setSelectedReason("");
      setSelectedValue("");
      setOtherReason("");
      setFormError("");
    }
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    Keyboard.dismiss();
    // Reset form state on close
    setSelectedReason("");
    setSelectedValue("");
    setOtherReason("");
    setFormError("");
  };

  const handleSubmit = async () => {
    setFormError("");

    // Validation: if "Other" is selected, require text in textarea
    if (selectedValue === "Other" && !otherReason.trim()) {
      setFormError("Please specify your reason");
      return;
    }

    if (!selectedValue) {
      setFormError("Please select a reason for removal");
      return;
    }

    try {
      await removeMember({
        societyId: member.societyId,
        studentId: member.id,
        reason: selectedReason,
      }).unwrap();

      toast.showSuccessToast("Student has been removed from the society");

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
    <KeyboardAvoidingView behavior="position" style={{ flex: 1 }}>
      <Actionsheet isOpen={open} onClose={handleClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          {/* Container without flex-1 to avoid layout issues */}
          <View className="p-6 w-full gap-y-4" style={{ height: 600 }}>
            {/* Header */}
            <View className="mb-6">
              <Text className="text-xl font-semibold text-error-600 mb-2">
                Are you sure you want to remove this member?
              </Text>
              <Text className="text-sm text-neutral-600 dark:text-neutral-400">
                Please select a reason for removal from the list below:
              </Text>
            </View>

            {/* Radio Group with ScrollView */}
            <View style={{ flex: 1 }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Removal Reasons */}
                {REMOVAL_REASONS.map((reason, idx) => (
                  <TouchableOpacity
                    key={`${reason.description}-${idx}`}
                    onPress={() => setSelectedValue(reason.description)}
                    className={`w-full p-4 rounded-lg border-2 flex-row items-center gap-3 mb-2 ${
                      selectedValue === reason.description
                        ? "border-primary-500 bg-primary-100/50"
                        : "border-outline-200 bg-white"
                    }`}
                    activeOpacity={0.7}
                  >
                    {/* Radio Indicator */}
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor:
                          selectedValue === reason.description
                            ? "#EF4444" // error-500
                            : "#D1D5DB",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 8,
                      }}
                    >
                      {selectedValue === reason.description && (
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: "#EF4444", // error-500
                          }}
                        />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="font-medium text-typography-900 mb-1">
                        {reason.title}
                      </Text>
                      <Text className="text-sm text-typography-600">
                        {reason.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}

                {/* Other Option */}
                <TouchableOpacity
                  onPress={() => setSelectedValue("Other")}
                  className={`w-full p-4 rounded-lg border-2 flex-row items-center gap-3 mb-2 ${
                    selectedValue === "Other"
                      ? "border-primary-500 bg-primary-100/50"
                      : "border-outline-200 bg-white"
                  }`}
                  activeOpacity={0.7}
                >
                  {/* Radio Indicator */}
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor:
                        selectedValue === "Other" ? "#EF4444" : "#D1D5DB",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 8,
                    }}
                  >
                    {selectedValue === "Other" && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: "#EF4444",
                        }}
                      />
                    )}
                  </View>
                  <Text className="font-medium text-typography-900">Other</Text>
                </TouchableOpacity>

                {selectedValue === "Other" && (
                  <View className="mt-3">
                    <Textarea
                      className={`min-h-20 ${
                        formError ? "border-error-500" : "border-outline-200"
                      }`}
                    >
                      <TextareaInput
                        value={otherReason}
                        onChangeText={setOtherReason}
                        placeholder="Please specify your reason"
                        multiline={true}
                        textAlignVertical="top"
                      />
                    </Textarea>
                    {formError && (
                      <Text className="text-error-500 text-sm mt-1">
                        {formError}
                      </Text>
                    )}
                  </View>
                )}
              </ScrollView>
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
                action="negative"
                className="flex-1"
                onPress={handleSubmit}
                disabled={!selectedValue || isLoading}
              >
                <ButtonText>{isLoading ? "Removing..." : "Confirm"}</ButtonText>
              </Button>
            </View>
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </KeyboardAvoidingView>
  );
};
