import { Link } from "react-router";

import SignIn from "@/features/auth/sign-in";

function SignInPage() {
  return (
    <div className="flex items-center justify-center w-full py-10 px-16 gap-x-16">
      <div className="flex-1 flex flex-col gap-y-10 bg-white drop-shadow-e1 p-8 rounded-md">
        <div className="space-y-2.5">
          <p className="b1-regular text-neutral-800">Welcome Back</p>
          <h3 className="h3-bold">
            Sign in to <span className="text-primary-600">SocioHub</span>
          </h3>
          <p className="b2-regular text-neutral-800">
            If you don't have an account,{" "}
            <Link to="/sign-up" className="text-primary-600">
              Register here!
            </Link>
          </p>
        </div>
        <SignIn />
      </div>
      <div className="flex-1 px-4">
        <img
          src="/assets/images/side-illustration.png"
          alt="illustration"
          className="w-full"
        />
      </div>
    </div>
  );
}
export default SignInPage;
