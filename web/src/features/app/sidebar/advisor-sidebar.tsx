import {
  Activity,
  Building,
  CalendarCheck,
  CalendarDays,
  CircleDollarSign,
  ImagePlus,
  LayoutDashboard,
  ListTodo,
  Megaphone,
  MessageSquare,
  Settings,
  ShieldHalf,
  Users,
  Video,
} from "lucide-react";

import { NavItem } from "./components/nav-item";

const navItems = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    href: "/dashboard",
  },
  {
    label: "Inbox",
    icon: <MessageSquare className="w-4 h-4" />,
    href: "/chats",
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
    label: "Payments & Finance",
    icon: <CircleDollarSign className="w-4 h-4" />,
    href: "/payments",
  },
  {
    label: "Teams",
    icon: <ShieldHalf className="w-4 h-4" />,
    href: "/teams",
  },
  {
    label: "Video Meetings",
    icon: <Video className="w-4 h-4" />,
    href: "/video-meetings",
  },
  {
    label: "Create Post",
    icon: <ImagePlus className="w-4 h-4" />,
    href: `/create-post`,
  },
  {
    label: "Calendar",
    icon: <CalendarDays className="w-4 h-4" />,
    href: "/calendar",
  },
  {
    label: "Activity Logs",
    icon: <Activity className="w-4 h-4" />,
    href: "/activity-logs",
  },
  {
    label: "Settings",
    icon: <Settings className="w-4 h-4" />,
    href: "/settings",
  },
];

export const AdvisorSidebar = ({
  onItemClick,
}: {
  onItemClick?: () => void;
}) => {
  return (
    <div className="flex flex-col py-4 w-full">
      {navItems.map((item) => (
        <NavItem key={item.href} item={item} onClick={onItemClick} />
      ))}
    </div>
  );
};
