import {
  CalendarDays,
  Compass,
  LayoutDashboard,
  MessageSquare,
} from "lucide-react";

import { useGetMySocietiesQuery } from "./api";
import { NavItem } from "./components/nav-item";
import { SocietyItems } from "./components/society-items";

const navItems = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    href: "/dashboard",
  },
  {
    label: "Explore",
    icon: <Compass className="w-4 h-4" />,
    href: "/explore",
  },
  {
    label: "Chat",
    icon: <MessageSquare className="w-4 h-4" />,
    href: "/inbox",
  },
  {
    label: "Calendar",
    icon: <CalendarDays className="w-4 h-4" />,
    href: "/calendar",
  },
];

export const StudentSidebar = () => {
  const { data: societies, isLoading } = useGetMySocietiesQuery();

  return (
    <div className="flex flex-col py-4">
      {navItems.map((item) => (
        <NavItem key={item.href} item={item} />
      ))}
      <div className="space-y-2 my-4">
        {societies &&
          !("error" in societies) &&
          societies.map((society) => (
            <SocietyItems key={society.id} society={society} />
          ))}
        {isLoading && <SocietyItems.Skeleton />}
      </div>
    </div>
  );
};
