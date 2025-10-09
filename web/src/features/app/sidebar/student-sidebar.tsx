import {
  CalendarDays,
  Compass,
  LayoutDashboard,
  ListTodo,
  MessageSquare,
} from "lucide-react";

import { NavItem } from "./components/nav-item";
import { SocietyItems } from "./components/society-items";
import { useAppSelector } from "@/app/hooks";

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
    href: "/chats",
  },
  {
    label: "Calendar",
    icon: <CalendarDays className="w-4 h-4" />,
    href: "/calendar",
  },
  {
    label: "To-Do",
    icon: <ListTodo className="w-4 h-4" />,
    href: "/todo",
  },
];

export const StudentSidebar = ({
  onItemClick,
}: {
  onItemClick?: () => void;
}) => {
  const { user } = useAppSelector((state) => state.auth);

  const societies = user && "registrationNumber" in user ? user.societies : [];

  return (
    <div className="flex flex-col py-4 w-full">
      {navItems.map((item) => (
        <NavItem key={item.href} item={item} onClick={onItemClick} />
      ))}
      <div className="space-y-2 my-4">
        {societies &&
          !("error" in societies) &&
          societies.map(({ society }) => (
            <SocietyItems
              key={society.id}
              society={society}
              onClick={onItemClick}
            />
          ))}
      </div>
    </div>
  );
};
