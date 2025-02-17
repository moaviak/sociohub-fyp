import { Outlet } from "react-router";

import { Header } from "./components/header";

function AuthLayout() {
  return (
    <div className="flex flex-col relative overflow-hidden">
      <Header />
      <img
        src="/assets/images/Background.png"
        alt=""
        className="absolute top-0 left-0 bg-contain -z-10"
      />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
export default AuthLayout;
