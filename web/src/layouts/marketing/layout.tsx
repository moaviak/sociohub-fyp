import { Outlet } from "react-router";

import { Navbar } from "./components/navbar";
import { Footer } from "./components/footer";

function MarketingLayout() {
  return (
    <div className="flex flex-col relative overflow-hidden">
      <Navbar />
      <img
        src="/assets/images/Background.png"
        alt=""
        className="absolute top-0 left-0 bg-contain -z-10"
      />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
export default MarketingLayout;
