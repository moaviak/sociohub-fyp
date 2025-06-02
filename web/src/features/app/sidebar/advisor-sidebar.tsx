import {
  Building,
  CalendarCheck,
  CalendarDays,
  CircleDollarSign,
  LayoutDashboard,
  ListTodo,
  Megaphone,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";

import { NavItem } from "./components/nav-item";

const navItems = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    href: "/dashboard",
  },
  {
    label: "Society Profile",
    icon: <Building className="w-4 h-4" />,
    href: `/society`,
  },
  {
    label: "Members",
    icon: <Users className="w-4 h-4" />,
    href: "/members",
  },
  {
    label: "Events",
    icon: <CalendarCheck className="w-4 h-4" />,
    href: "/events",
  },
  {
    label: "To-Do",
    icon: <ListTodo className="w-4 h-4" />,
    href: "/todo",
  },
  {
    label: "Announcements",
    icon: <Megaphone className="w-4 h-4" />,
    href: "/announcements",
  },
  {
    label: "Finance",
    icon: <CircleDollarSign className="w-4 h-4" />,
    href: "/finance",
  },
  {
    label: "Inbox",
    icon: <MessageSquare className="w-4 h-4" />,
    href: "/inbox",
  },
  {
    label: "Calendar",
    icon: <CalendarDays className="w-4 h-4" />,
    href: "/calendar",
  },
  {
    label: "Settings",
    icon: <Settings className="w-4 h-4" />,
    href: "/settings",
  },
];

export const AdvisorSidebar = () => {
  return (
    <div className="flex flex-col py-4 xl:min-w-[220px]">
      {navItems.map((item) => (
        <NavItem key={item.href} item={item} />
      ))}
    </div>
  );
};
