import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router";

export const NavItem = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  const location = useLocation();
  const isActive = href === location.pathname;

  return (
    <NavigationMenuLink asChild active={isActive}>
      <Link
        to={href}
        className={cn(
          "b2-medium hover:text-neutral-950",
          isActive ? "text-neutral-950" : "text-neutral-500"
        )}
      >
        {children}
      </Link>
    </NavigationMenuLink>
  );
};
