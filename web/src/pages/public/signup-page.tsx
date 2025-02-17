import { Link, Outlet, useLocation } from "react-router";

import { Button } from "@/components/ui/button";

function SignUpPage() {
  const location = useLocation();
  const isRoleSelection = location.pathname === "/sign-up";

  return (
    <div className="flex flex-col items-center w-full p-6 gap-y-6">
      {isRoleSelection ? (
        <>
          <div className="text-center">
            <h2 className="h2-bold">
              Sign Up for <span className="text-primary-600">SocioHub</span>
            </h2>
            <p className="b1-regular">Please select your role to continue</p>
          </div>
          <div className="flex justify-center gap-x-4">
            <div className="flex flex-col gap-y-5 items-center text-center py-14 px-16 w-lg bg-white drop-shadow-e1">
              <img
                src="/assets/icons/student.svg"
                alt="student"
                className="w-20"
              />
              <div>
                <h3 className="h3-bold text-primary-600">I am a Student</h3>
                <p className="b2-regular text-primary-900">
                  Discover and join societies, participate in events, and stay
                  updated.
                </p>
              </div>
              <Button size="lg" asChild>
                <Link to="student">Student Signup</Link>
              </Button>
            </div>
            <div className="flex flex-col gap-y-5 items-center text-center py-14 px-16 w-lg bg-white drop-shadow-e1">
              <img
                src="/assets/icons/advisor.svg"
                alt="student"
                className="w-20"
              />
              <div>
                <h3 className="h3-bold text-secondary-600">
                  I am a Society Advisor
                </h3>
                <p className="b2-regular text-secondary-900">
                  Register and manage your society, create events, and
                  collaborate with members.
                </p>
              </div>
              <Button size="lg" variant="secondary" asChild>
                <Link to="advisor">Advisor Signup</Link>
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="py-6 w-full">
          <Outlet />
        </div>
      )}
    </div>
  );
}

export default SignUpPage;
