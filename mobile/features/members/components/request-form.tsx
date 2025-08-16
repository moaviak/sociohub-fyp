import React, { useState, useEffect, useCallback } from "react";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { JoinRequest } from "@/types";
import { useHandleSocietyRequestMutation } from "../api";
import ApiError from "@/store/api-error";
import { JoinRequestStatus, RequestAction } from "@/types";
import {
  KeyboardAvoidingView,
  ScrollView,
  View,
  Keyboard,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { formatDate } from "@/lib/utils";
import { Divider } from "@/components/ui/divider";
import { Box } from "@/components/ui/box";
import { REJECT_REASONS } from "@/data";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useToastUtility } from "@/hooks/useToastUtility";

type SheetStep = "request-details" | "reject-confirmation";

export const RequestForm = ({
  request,
  open,
  setOpen,
}: {
  request: JoinRequest;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const [currentStep, setCurrentStep] = useState<SheetStep>("request-details");
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToastUtility();
  const [handleSocietyRequest, { isLoading }] =
    useHandleSocietyRequestMutation();

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
      setCurrentStep("request-details");
      resetRejectForm();
    }
  }, [open]);

  const resetRejectForm = () => {
    setSelectedReason("");
    setSelectedValue("");
    setOtherReason("");
    setFormError("");
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (!isSubmitting && !isLoading) {
      setOpen(false);
      setCurrentStep("request-details");
      resetRejectForm();
      Keyboard.dismiss();
    }
  };

  const onAction = async (action: RequestAction, reason?: string) => {
    try {
      await handleSocietyRequest({
        societyId: request.societyId,
        studentId: request.studentId,
        action,
        reason,
      }).unwrap();

      const successMessage =
        action === RequestAction.ACCEPT
          ? "Student request has been accepted."
          : "Student request has been rejected.";

      toast.showSuccessToast(successMessage);
      handleClose();
    } catch (error) {
      const message =
        (error as ApiError).errorMessage ||
        (error as Error).message ||
        "Unexpected error occurred. Please try again!";

      toast.showErrorToast(message);
    }
  };

  const handleAccept = () => {
    onAction(RequestAction.ACCEPT);
  };

  const handleReject = () => {
    setCurrentStep("reject-confirmation");
  };

  const handleBackToDetails = () => {
    setCurrentStep("request-details");
    resetRejectForm();
  };

  // Handler for text input change - simplified without dependencies
  const handleTextChange = useCallback((text: string) => {
    setOtherReason(text);
    setFormError(""); // Always clear error on text change
  }, []);

  // Handler for radio selection change - simplified without dependencies
  const handleRadioChange = useCallback((value: string) => {
    setSelectedValue(value);
    setFormError(""); // Always clear error on selection change
    // If switching away from "Other", clear the other reason
    if (selectedValue === "Other" && value !== "Other") {
      setOtherReason("");
    }
  }, []);

  const handleRejectSubmit = async () => {
    setFormError("");
    setIsSubmitting(true);

    // Validation: if "Other" is selected, require text in textarea
    if (selectedValue === "Other" && !otherReason.trim()) {
      setFormError("Please specify your reason");
      setIsSubmitting(false);
      return;
    }

    // Validation: ensure a reason is selected
    if (!selectedValue) {
      setFormError("Please select a reason for rejection");
      setIsSubmitting(false);
      return;
    }

    try {
      await onAction(RequestAction.REJECT, selectedReason);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error("Error rejecting request:", error);
    }
  };

  const renderRequestDetails = () => (
    <VStack space="md" className="p-4">
      {/* Header */}
      <HStack className="justify-between items-center">
        <Heading size="lg" className="text-primary-500">
          Membership Request
        </Heading>
      </HStack>

      <Text size="sm" className="text-typography-500 mb-2">
        Review the membership request from the student and take the suitable
        action.
      </Text>

      <View style={{ height: 400 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <VStack space="lg">
            {/* Student Information Grid */}
            <VStack space="md">
              <HStack className="justify-between">
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Student Name
                  </Text>
                  <Text size="sm" className="font-semibold">
                    {`${request.student.firstName} ${request.student.lastName}`}
                  </Text>
                </VStack>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Registration #
                  </Text>
                  <Text size="sm" className="font-semibold">
                    {request.student.registrationNumber}
                  </Text>
                </VStack>
              </HStack>

              <HStack className="justify-between">
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Email
                  </Text>
                  <Text size="sm" className="font-semibold">
                    {request.student.email}
                  </Text>
                </VStack>
                <VStack className="flex-1">
                  <Text size="sm" className="text-typography-500">
                    Request Date
                  </Text>
                  <Text size="sm" className="font-semibold">
                    {formatDate(request.createdAt)}
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            <Divider />

            {/* WhatsApp Number */}
            <VStack space="xs">
              <Text size="sm" className="text-typography-500">
                WhatsApp Number
              </Text>
              <Box className="w-full border border-outline-300 rounded-md p-3">
                <Text size="sm">{request.whatsappNo}</Text>
              </Box>
            </VStack>

            {/* Semester */}
            <VStack space="xs">
              <Text size="sm" className="text-typography-500">
                Semester
              </Text>
              <Box className="w-full border border-outline-300 rounded-md p-3">
                <Text size="sm">{request.semester}</Text>
              </Box>
            </VStack>

            {/* Interested Role */}
            <VStack space="xs">
              <Text size="sm" className="text-typography-500">
                Interested Role
              </Text>
              <Box className="w-full border border-outline-300 rounded-md p-3">
                <Text size="sm">
                  {request.interestedRole?.name || "Not specified"}
                </Text>
              </Box>
            </VStack>

            {/* Reason for joining */}
            <VStack space="xs">
              <Text size="sm" className="text-typography-500">
                Reason for joining
              </Text>
              <Box className="min-h-20 w-full border border-outline-300 rounded-md p-3">
                <Text size="sm">{request.reason}</Text>
              </Box>
            </VStack>

            {/* Expectations */}
            <VStack space="xs">
              <Text size="sm" className="text-typography-500">
                Expectations from the society
              </Text>
              <Box className="min-h-20 w-full border border-outline-300 rounded-md p-3">
                <Text size="sm">{request.expectations}</Text>
              </Box>
            </VStack>

            {/* Skills */}
            <VStack space="xs">
              <Text size="sm" className="text-typography-500">
                Relevant Skills
              </Text>
              <Box className="min-h-12 w-full border border-outline-300 rounded-md p-3">
                <Text size="sm">{request.skills || "Not specified"}</Text>
              </Box>
            </VStack>
          </VStack>
        </ScrollView>
      </View>

      {/* Action Buttons */}
      <VStack space="sm" className="pt-4">
        {request.pdf && (
          <Button
            variant="outline"
            className="w-full"
            onPress={async () => {
              if (request.pdf) {
                if (Platform.OS === "web") {
                  Linking.openURL(request.pdf);
                } else {
                  await WebBrowser.openBrowserAsync(request.pdf);
                }
              }
            }}
          >
            <ButtonText>Download PDF</ButtonText>
          </Button>
        )}

        {request.status === JoinRequestStatus.PENDING && (
          <HStack space="sm" className="w-full">
            <Button
              variant="solid"
              action="negative"
              className="flex-1"
              onPress={handleReject}
              isDisabled={isLoading}
            >
              <ButtonText>Reject</ButtonText>
            </Button>
            <Button
              variant="solid"
              action="positive"
              className="flex-1"
              onPress={handleAccept}
              isDisabled={isLoading}
            >
              <ButtonText>Accept</ButtonText>
            </Button>
          </HStack>
        )}
      </VStack>
    </VStack>
  );

  const renderRejectConfirmation = () => (
    <View className="p-6 w-full gap-y-4" style={{ height: 600 }}>
      {/* Header */}
      <View className="mb-6">
        <Text className="text-xl font-semibold text-primary-500 mb-2">
          Are you sure you want to reject this request?
        </Text>
        <Text className="text-sm text-neutral-600 dark:text-neutral-400">
          Please select a reason for rejection from the list below:
        </Text>
      </View>

      {/* Radio Group with ScrollView */}
      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <VStack space="sm" className="gap-3">
            {REJECT_REASONS.map((reason, idx) => (
              <TouchableOpacity
                key={`${reason.description}-${idx}`}
                onPress={() => handleRadioChange(reason.description)}
                className={`w-full p-4 rounded-lg border-2 flex-row items-center gap-3 ${
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
                        ? "#3B82F6"
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
                        backgroundColor: "#3B82F6",
                      }}
                    />
                  )}
                </View>
                <VStack className="items-start flex-1">
                  <Text
                    className={`font-semibold text-left mb-1 ${
                      selectedValue === reason.description
                        ? "text-primary-700"
                        : "text-typography-900"
                    }`}
                  >
                    {reason.title}
                  </Text>
                  <Text
                    className={`text-sm text-left ${
                      selectedValue === reason.description
                        ? "text-primary-600"
                        : "text-typography-600"
                    }`}
                  >
                    {reason.description}
                  </Text>
                </VStack>
              </TouchableOpacity>
            ))}

            {/* Other Option */}
            <TouchableOpacity
              onPress={() => handleRadioChange("Other")}
              className={`w-full p-4 rounded-lg border-2 flex-row items-center gap-3 ${
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
                    selectedValue === "Other" ? "#3B82F6" : "#D1D5DB",
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
                      backgroundColor: "#3B82F6",
                    }}
                  />
                )}
              </View>
              <Text
                className={`font-semibold ${
                  selectedValue === "Other"
                    ? "text-primary-700"
                    : "text-typography-900"
                }`}
              >
                Other
              </Text>
            </TouchableOpacity>

            {selectedValue === "Other" && (
              <View className="mt-3">
                <Textarea
                  className={`${
                    formError && selectedValue === "Other"
                      ? "border-error-500"
                      : "border-outline-200"
                  }`}
                >
                  <TextareaInput
                    value={otherReason}
                    onChangeText={handleTextChange}
                    placeholder="Please specify your reason"
                    multiline={true}
                    textAlignVertical="top"
                    submitBehavior={"blurAndSubmit"}
                    returnKeyType="default"
                    enablesReturnKeyAutomatically={false}
                  />
                </Textarea>
                {formError && selectedValue === "Other" && (
                  <Text className="text-error-500 text-sm mt-1">
                    {formError}
                  </Text>
                )}
              </View>
            )}
          </VStack>

          {formError && selectedValue !== "Other" && (
            <Text className="text-error-500 text-sm mt-3">{formError}</Text>
          )}
        </ScrollView>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onPress={handleBackToDetails}
          disabled={isSubmitting || isLoading}
        >
          <ButtonText>Back</ButtonText>
        </Button>
        <Button
          action="negative"
          className="flex-1"
          onPress={handleRejectSubmit}
          disabled={!selectedValue || isSubmitting || isLoading}
        >
          <ButtonText>
            {isSubmitting || isLoading ? "Confirming..." : "Confirm"}
          </ButtonText>
        </Button>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior="position" style={{ flex: 1 }}>
      <Actionsheet isOpen={open} onClose={handleClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="pb-6 max-h-[85%]">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          {currentStep === "request-details" && renderRequestDetails()}
          {currentStep === "reject-confirmation" && renderRejectConfirmation()}
        </ActionsheetContent>
      </Actionsheet>
    </KeyboardAvoidingView>
  );
};
