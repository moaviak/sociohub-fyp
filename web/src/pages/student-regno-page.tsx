import RegNo from "@/features/auth/sign-up/student/reg-no";

function StudentRegNoPage() {
  return (
    <div className="w-[80%] mx-auto flex items-center justify-center gap-x-10 bg-white rounded-md drop-shadow-e1 py-20 px-20">
      <div className="flex flex-col items-center gap-y-6">
        <img src="/assets/logo-sociohub.svg" alt="logo" className="w-3xs" />
        <p className="b3-regular text-neutral-600">
          Please enter your registration number to continue using your account.
        </p>
      </div>
      <RegNo />
    </div>
  );
}
export default StudentRegNoPage;
