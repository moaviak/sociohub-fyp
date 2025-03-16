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
import SocietyFormPage from "@/pages/society-form-page";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Marketing Routes */}
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/contact-us" element={<ContactPage />} />
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          {/* Public Auth Routes */}
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />}>
            <Route path="student" element={<StudentSignUpPage />} />
            <Route path="advisor" element={<AdvisorSignUpPage />} />
          </Route>

          {/* Auth-Required Onboarding Routes */}
          <Route path="/sign-up/verify-email" element={<VerifyEmailPage />} />
          <Route path="/sign-up/society-form" element={<SocietyFormPage />} />
        </Route>

        {/* Private Routes */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* Add other private routes here */}
        </Route>
      </Route>
    </Routes>
  );
}
export default App;
