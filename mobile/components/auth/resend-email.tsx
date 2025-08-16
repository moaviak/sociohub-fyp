import ApiError from "@/store/api-error";
import { MutationDefinition } from "@reduxjs/toolkit/query";
import { FetchArgs } from "@reduxjs/toolkit/query";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { BaseQueryFn } from "@reduxjs/toolkit/query";
import { MutationActionCreatorResult } from "@reduxjs/toolkit/query";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Button, ButtonText } from "../ui/button";
import { formatTime } from "@/lib/utils";
import { useToastUtility } from "@/hooks/useToastUtility";

interface ResendEmailProps {
  setOtp: React.Dispatch<React.SetStateAction<string>>;
  resendEmail: (
    arg: null
  ) => MutationActionCreatorResult<
    MutationDefinition<
      null,
      BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
      "Auth",
      ApiError | null,
      "api"
    >
  >;
  disabled: boolean;
}

export const ResendEmail = ({
  setOtp,
  resendEmail,
  disabled,
}: ResendEmailProps) => {
  const [resendTimer, setResendTimer] = useState(0);
  const { showSuccessToast } = useToastUtility();

  const onResend = async () => {
    if (resendTimer > 0) return;

    try {
      const response = await resendEmail(null);
      if (response.data) {
        showSuccessToast("Mail has been sent to your email.");
        setOtp("");
        setResendTimer(120);
      }
    } catch (error) {
      console.error("Resend error:", error);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | number;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  return (
    <View className="justify-center items-center flex-row">
      <Text className="text-sm">Didn't receive the code? </Text>
      <Button
        variant="link"
        className="text-primary-600"
        onPress={() => onResend()}
        isDisabled={disabled || resendTimer > 0}
      >
        <ButtonText className="text-sm">
          {resendTimer > 0
            ? `Resend Code (${formatTime(resendTimer)})`
            : "Resend Code"}
        </ButtonText>
      </Button>
    </View>
  );
};
