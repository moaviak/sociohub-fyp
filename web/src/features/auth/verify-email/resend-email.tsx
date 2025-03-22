import { toast } from "sonner";
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  MutationActionCreatorResult,
  MutationDefinition,
} from "@reduxjs/toolkit/query";
import { useEffect, useState } from "react";

import { formatTime } from "@/lib/utils";
import ApiError from "@/features/api-error";
import { Button } from "@/components/ui/button";

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

  const onResend = async () => {
    if (resendTimer > 0) return;

    try {
      const response = await resendEmail(null);
      if (response.data) {
        toast.success("Mail has been sent to your email.");
        setOtp("");
        setResendTimer(120);
      }
    } catch (error) {
      console.error("Resend error:", error);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  return (
    <div className="text-sm text-neutral-800">
      Didn't receive the code?{" "}
      <Button
        variant="ghost"
        className="text-blue-600 p-0"
        onClick={onResend}
        disabled={disabled || resendTimer > 0}
      >
        {resendTimer > 0
          ? `Resend Code (${formatTime(resendTimer)})`
          : "Resend Code"}
      </Button>
    </div>
  );
};
