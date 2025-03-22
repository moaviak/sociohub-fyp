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

  return (
    <Link
      key={item.href}
      className={cn(
        "flex gap-x-4 w-[220px] b3-regular justify-start items-center"
      )}
      to={item.href}
    >
      <span
        className={cn(
          "h-full w-[8px] rounded-r-sm",
          location.pathname === item.href && "bg-primary-600"
        )}
      />
      <div
        className={cn(
          "flex gap-x-2 p-4 w-full rounded-sm",
          location.pathname === item.href && "bg-primary-600 text-white"
        )}
      >
        {item.icon}
        {item.label}
      </div>
    </Link>
  );
};
