import { cn } from "@/lib/utils";
import { Bell, CircleUser } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router";

const navItems = [
  {
    label: "Profile",
    icon: <CircleUser className="w-4 h-4" />,
    href: "/user-settings/profile",
  },
  {
    label: "Notifications",
    icon: <Bell className="w-4 h-4" />,
    href: "/user-settings/notifications",
  },
];

export default function UserSettingsLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col gap-y-4 px-4 py-2 h-full">
      <h3 className="h3-semibold">Settings</h3>
      <div className="flex-1 grid grid-cols-10 gap-2">
        <div className="col-span-2">
          <div className="flex flex-col gap-y-2 py-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;

              return (
                <Link
                  to={`${item.href}`}
                  key={item.href}
                  className={cn(
                    "flex gap-x-2 b3-regular justify-start items-center rounded-md p-3",
                    isActive && "bg-primary-600 text-white"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="col-span-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
