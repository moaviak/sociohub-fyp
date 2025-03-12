import { SocietyForm } from "@/features/auth/sign-up/advisor/society-form";

function SocietyFormPage() {
  return (
    <div className="w-[70%] mx-auto flex flex-col items-center gap-y-10 bg-white rounded-md drop-shadow-e1 py-10 px-20">
      <div className="space-y-2 text-center">
        <h3 className="h3-bold">Create a Society</h3>
        <p className="b2-regular text-neutral-800">
          Add the details to create a society
        </p>
      </div>
      <SocietyForm />
    </div>
  );
}
export default SocietyFormPage;
