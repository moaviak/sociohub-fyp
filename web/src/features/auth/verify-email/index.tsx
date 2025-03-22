import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { UserType } from "@/types";
import ApiError from "@/features/api-error";
import { Button } from "@/components/ui/button";

import { useVerifyEmailMutation, useResendEmailMutation } from "../api";

export const VerifyEmail = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const [verifyEmail, { isLoading, isError, error }] = useVerifyEmailMutation();
  const [
    resendEmail,
    { isLoading: isResending, isError: isResendError, error: resendError },
  ] = useResendEmailMutation();

  useEffect(() => {
    if (isError || isResendError) {
      const errorMessage =
        (error as ApiError)?.errorMessage ||
        (resendError as ApiError)?.errorMessage ||
        "An unexpected error occurred";
      toast.error(errorMessage, {
        duration: 10000,
      });
    }
  }, [isError, error, isResendError, resendError]);

  const onVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid OTP");
      return;
    }

    try {
      const response = await verifyEmail({ otp });

      if (response.data && "user" in response.data) {
        if (response.data.user.isEmailVerified) {
          toast.success("Email verified successfully");
          if (response.data.userType === UserType.STUDENT) {
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/sign-up/society-form", { replace: true });
          }
          setTimeout(() => {
            sessionStorage.removeItem("verificationEmail");
          }, 1000);
        } else {
          toast.error("Invalid OTP");
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
    }
  };

  const onResend = async () => {
    try {
      const response = await resendEmail(null);
      if (response.data) {
        toast.success("Mail has been sent to your email.");
        setOtp("");
      }
    } catch (error) {
      console.error("Resend error:", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-y-8">
      <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
        <InputOTPGroup className="border border-neutral-600 rounded-md">
          <InputOTPSlot
            index={0}
            className="h-14 w-14 text-2xl border-r border-r-neutral-600 "
          />
          <InputOTPSlot
            index={1}
            className="h-14 w-14 text-2xl border-r border-r-neutral-600 "
          />
          <InputOTPSlot index={2} className="h-14 w-14 text-2xl" />
        </InputOTPGroup>
        <InputOTPSeparator className="text-neutral-600" />
        <InputOTPGroup className="border border-neutral-600 rounded-md">
          <InputOTPSlot
            index={3}
            className="h-14 w-14 text-2xl border-r border-r-neutral-600 "
          />
          <InputOTPSlot
            index={4}
            className="h-14 w-14 text-2xl border-r border-r-neutral-600 "
          />
          <InputOTPSlot index={5} className="h-14 w-14 text-2xl" />
        </InputOTPGroup>
      </InputOTP>

      <div className="space-y-4 w-full text-center">
        <Button
          size="lg"
          className="w-full rounded-md bg-primary-600 py-3 text-white"
          onClick={onVerify}
          disabled={isLoading || isResending}
        >
          {isLoading ? "Verifying..." : "Verify"}
        </Button>

        <div className="text-sm text-neutral-800">
          Didn't receive the code?{" "}
          <Button
            variant="ghost"
            className="text-blue-600 p-0"
            onClick={onResend}
          >
            Resend Code
          </Button>
        </div>
      </div>
    </div>
  );
};
