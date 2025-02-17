import { Route, Routes } from "react-router";

import AuthLayout from "@/layouts/auth/layout";
import SignUpPage from "@/pages/public/signup-page";
import SignInPage from "@/pages/public/signin-page";
import LandingPage from "@/pages/public/landing-page";
import ContactPage from "@/pages/public/contact-page";
import MarketingLayout from "@/layouts/marketing/layout";
import StudentSignUpPage from "@/pages/public/student-signup-page";
import AdvisorSignUpPage from "@/pages/public/advisor-signup-page";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/contact-us" element={<ContactPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />}>
          <Route path="student" element={<StudentSignUpPage />} />
          <Route path="advisor" element={<AdvisorSignUpPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
export default App;
