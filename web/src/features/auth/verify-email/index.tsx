import { useState } from "react";
import { Navigate } from "react-router";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";

export const VerifyEmail = () => {
  const email = sessionStorage.getItem("verificationEmail");
  const [otp, setOtp] = useState("");

  if (!email) {
    return <Navigate to="/sign-in" />;
  }

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
          onClick={() => {
            // Add your verification logic here
          }}
        >
          Verify
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
