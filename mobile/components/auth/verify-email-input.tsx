import { useEffect, useRef, useState } from "react";
import { OtpInput } from "react-native-otp-entry";
import { VStack } from "../ui/vstack";
import { Button, ButtonText } from "../ui/button";
import {
  useResendEmailMutation,
  useVerifyEmailMutation,
} from "@/store/auth/api";
import { Toast, ToastDescription, useToast } from "../ui/toast";
import ApiError from "@/store/api-error";
import { UserType } from "@/types";
import { router } from "expo-router";
import { ResendEmail } from "./resend-email";
import { useToastUtility } from "@/hooks/useToastUtility";

export const VerifyEmailInput = () => {
  const { showErrorToast, showSuccessToast } = useToastUtility();

  const [otp, setOtp] = useState("");
  const [verifyEmail, { isLoading, isError, error }] = useVerifyEmailMutation();
  const [
    resendEmail,
    { isLoading: isResending, isError: isResendError, error: resendError },
  ] = useResendEmailMutation();

  useEffect(() => {
    if (isError || isResendError) {
      showErrorToast(
        (error as ApiError)?.errorMessage ||
          (resendError as ApiError)?.errorMessage ||
          "An unexpected error occurred"
      );
    }
  }, [isError, error, isResendError, resendError]);

  const onVerify = async () => {
    if (otp.length !== 6) {
      showErrorToast("Please enter a valid OTP");
      return;
    }

    try {
      const response = await verifyEmail({ otp });

      if (response.data && "user" in response.data) {
        if (response.data.user.isEmailVerified) {
          showSuccessToast("Email verified successfully");
          if (response.data.userType === UserType.STUDENT) {
            router.replace("/");
          } else {
            router.replace("/auth/society-form");
          }
        } else {
          showErrorToast("Invalid OTP");
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
    }
  };

  return (
    <VStack space="xl">
      <OtpInput numberOfDigits={6} focusColor="#218bff" onTextChange={setOtp} />
      <Button
        size="lg"
        className="bg-primary-500 rounded-md"
        onPress={() => onVerify()}
        isDisabled={isLoading || isResending || otp.length < 6}
      >
        <ButtonText className="font-body text-base">Verify</ButtonText>
      </Button>
      <ResendEmail
        setOtp={setOtp}
        resendEmail={resendEmail}
        disabled={isLoading || isResending}
      />
    </VStack>
  );
};
