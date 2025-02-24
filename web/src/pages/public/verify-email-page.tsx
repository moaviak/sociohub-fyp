import { VerifyEmail } from "@/features/auth/verify-email";

function VerifyEmailPage() {
  return (
    <div className="w-[50%] mx-auto flex flex-col items-center gap-y-10 bg-white rounded-md drop-shadow-e1 py-10 px-20">
      <div className="space-y-2 text-center">
        <h3 className="h3-bold">Verify Your Email</h3>
        <p className="b2-regular text-neutral-800">
          We have sent a 6-digit verification code to your email address. Please
          enter the code below to complete the signup process.
        </p>
      </div>
      <VerifyEmail />
    </div>
  );
}
export default VerifyEmailPage;
