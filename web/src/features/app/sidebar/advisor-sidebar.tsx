import {
  CalendarCheck,
  CalendarDays,
  CircleDollarSign,
  LayoutDashboard,
  ListTodo,
  Megaphone,
  MessageSquare,
  ShieldHalf,
  Users,
} from "lucide-react";

import { NavItem } from "./components/nav-item";

const navItems = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    href: "/dashboard",
  },
  {
    label: "Members",
    icon: <Users className="w-5 h-5" />,
    href: "/members",
  },
  {
    label: "Events",
    icon: <CalendarCheck className="w-5 h-5" />,
    href: "/events",
  },
  {
    label: "To-Do",
    icon: <ListTodo className="w-5 h-5" />,
    href: "/todo",
  },
  {
    label: "Announcements",
    icon: <Megaphone className="w-5 h-5" />,
    href: "/annoucements",
  },
  {
    label: "Finance",
    icon: <CircleDollarSign className="w-5 h-5" />,
    href: "/finance",
  },
  {
    label: "Teams",
    icon: <ShieldHalf className="w-5 h-5" />,
    href: "/teams",
  },
  {
    label: "Inbox",
    icon: <MessageSquare className="w-5 h-5" />,
    href: "/inbox",
  },
  {
    label: "Calendar",
    icon: <CalendarDays className="w-5 h-5" />,
    href: "/calendar",
  },
];

export const AdvisorSidebar = () => {
  return (
    <div className="flex flex-col py-4">
      {navItems.map((item) => (
        <NavItem key={item.href} item={item} />
      ))}
    </div>
  );
};
