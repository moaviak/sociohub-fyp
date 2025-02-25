import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import ApiError from "@/features/api-error";
import { Button } from "@/components/ui/button";

import { useVerifyEmailMutation } from "../api";

export const VerifyEmail = () => {
  const email = sessionStorage.getItem("verificationEmail");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const [verifyEmail, { isLoading, isError, error }] = useVerifyEmailMutation();

  useEffect(() => {
    if (isError) {
      toast.error(
        (error as ApiError)?.errorMessage || "An unexpected error occurred",
        {
          duration: 10000,
        }
      );
    }
  }, [isError, error]);

  if (!email) {
    return <Navigate to="/sign-in" />;
  }

  const onVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid OTP");
      return;
    }

    const response = await verifyEmail({ email, otp });

    if (response.data && "isEmailVerified" in response.data) {
      if (response.data.isEmailVerified) {
        toast.success("Email verified successfully");
        navigate("/dashboard");
      } else {
        toast.error("Invalid OTP");
      }
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
          disabled={isLoading}
        >
          {isLoading ? "Verifying..." : "Verify"}
        </Button>

        <div className="text-sm text-neutral-800">
          Didn't receive the code?{" "}
          <Button variant="ghost" className="text-blue-600 p-0">
            Resend Code
          </Button>
        </div>
      </div>
    </div>
  );
};
