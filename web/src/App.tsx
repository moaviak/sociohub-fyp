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

import MembersPage from "@/pages/app/members";
import NotFoundPage from "@/pages/not-found-page";
import ExplorePage from "@/pages/app/explore-page";
import DashboardPage from "@/pages/app/dashboard-page";
import RolesPage from "@/pages/app/members/roles-page";
import SocietyFormPage from "@/pages/society-form-page";
import VerifyEmailPage from "@/pages/verify-email-page";
import RequestsPage from "@/pages/app/members/requests-page";
import RequestsHistoryPage from "./pages/app/members/requests-history-page";
import SocietySettingsPage from "./pages/app/society-settings-page";

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

          {/* Student specific routes */}
          <Route path="/explore" element={<ExplorePage />} />

          {/* Society specific  routes*/}
          <Route path="/members" element={<MembersPage />}>
            <Route path="roles" element={<RolesPage />} />
            <Route path="requests" element={<RequestsPage />}>
              <Route path="history" element={<RequestsHistoryPage />} />
            </Route>

            <Route path=":societyId" element={<MembersPage />}>
              <Route path="roles" element={<RolesPage />} />
              <Route path="requests" element={<RequestsPage />}>
                <Route path="history" element={<RequestsHistoryPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="/settings" element={<SocietySettingsPage />}>
            <Route path=":societyId" element={<SocietySettingsPage />} />
          </Route>

          {/* Add other private routes here */}
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
export default App;
