import Sidebar from "@/features/app/society-settings/sidebar";
import { Outlet } from "react-router";

function SocietySettingsLayout() {
  return (
    <div className="flex flex-col gap-y-4 px-4 py-2 h-full">
      <h3 className="h3-semibold">Society Settings</h3>
      <div className="flex-1 grid grid-cols-10 gap-2">
        <div className="col-span-2">
          <Sidebar />
        </div>
        <div className="col-span-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
export default SocietySettingsLayout;
