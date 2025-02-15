import { Route, Routes } from "react-router";

import LandingPage from "@/pages/public/landing-page";
import ContactPage from "@/pages/public/contact-page";
import MarketingLayout from "@/layouts/marketing/layout";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/contact-us" element={<ContactPage />} />
      </Route>
    </Routes>
  );
}
export default App;
