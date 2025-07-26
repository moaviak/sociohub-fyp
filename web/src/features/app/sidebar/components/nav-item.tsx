import { Link, useLocation } from "react-router";

import { cn } from "@/lib/utils";

interface NavItemProps {
  item: {
    href: string;
    icon: React.ReactNode;
    label: string;
  };
}

export const NavItem = ({ item }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(item.href);

  return (
    <Link
      key={item.href}
      className={cn("flex gap-x-4 b3-regular justify-start items-center")}
      to={item.href}
    >
      <span
        className={cn(
          "h-13 w-[8px] rounded-r-sm shrink-0",
          isActive && "bg-primary-600"
        )}
      />
      <div
        className={cn(
          "flex gap-x-2 p-4 w-full rounded-sm",
          isActive && "bg-primary-600 text-white"
        )}
      >
        {item.icon}
        {item.label}
      </div>
    </Link>
  );
};
