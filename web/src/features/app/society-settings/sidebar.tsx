import useGetSocietyId from "@/hooks/useGetSocietyId";
import { cn } from "@/lib/utils";
import { IdCard, Users } from "lucide-react";
import { Link, useLocation } from "react-router";

const navItems = [
  {
    label: "Public Profile",
    icon: <IdCard className="w-4 h-4" />,
    href: "profile",
  },
  {
    label: "Members & Requests",
    icon: <Users className="w-4 h-4" />,
    href: "members",
  },
];

const Sidebar = () => {
  const location = useLocation();
  const societyId = useGetSocietyId();

  return (
    <div className="flex flex-col gap-y-2 py-4">
      {navItems.map((item) => {
        const isActive = location.pathname.endsWith(item.href);
        return (
          <Link
            to={`${societyId || ""}/${item.href}`}
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
  );
};
export default Sidebar;
