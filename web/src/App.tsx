import { Route, Routes } from "react-router";

import AppLayout from "@/layouts/app/layout";
import MainLayout from "@/layouts/main-layout";
import AuthLayout from "@/layouts/auth/layout";
import MarketingLayout from "@/layouts/marketing/layout";

import SignUpPage from "@/pages/public/signup-page";
import SignInPage from "@/pages/public/signin-page";
import LandingPage from "@/pages/public/landing-page";
import ContactPage from "@/pages/public/contact-page";
import StudentSignUpPage from "@/pages/public/student-signup-page";
import AdvisorSignUpPage from "@/pages/public/advisor-signup-page";

import DashboardPage from "@/pages/app/dashboard-page";
import VerifyEmailPage from "@/pages/verify-email-page";
import StudentRegNoPage from "@/pages/student-regno-page";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/contact-us" element={<ContactPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />}>
            <Route path="student" element={<StudentSignUpPage />}>
              <Route path="reg-no" element={<StudentRegNoPage />} />
            </Route>
            <Route path="advisor" element={<AdvisorSignUpPage />} />
            <Route path="verify-email" element={<VerifyEmailPage />} />
          </Route>
        </Route>

        {/* Private Routes */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
export default App;
