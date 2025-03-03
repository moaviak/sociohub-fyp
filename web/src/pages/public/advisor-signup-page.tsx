import { Link } from "react-router";

import AdvisorSignUp from "@/features/auth/sign-up/advisor";

function AdvisorSignUpPage() {
  return (
    <div className="w-[85%] mx-auto flex flex-col items-center gap-y-10 bg-white rounded-md drop-shadow-e1 py-10 px-20">
      <div className="space-y-2 text-center">
        <p className="b1-regular text-neutral-800">
          Welcome to <span className="text-primary-600 b1-bold">SocioHub</span>
        </p>
        <h3 className="h3-bold">Create Advisor Account</h3>
        <p className="b2-regular text-neutral-800">
          Already have an account?{" "}
          <Link to="/sign-in" className="text-primary-600">
            Log In
          </Link>
        </p>
      </div>
      <AdvisorSignUp />
    </div>
  );
}
export default AdvisorSignUpPage;
