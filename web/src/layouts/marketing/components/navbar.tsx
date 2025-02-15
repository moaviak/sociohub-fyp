import { Logo } from "@/components/logo";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

import { NavItem } from "./nav-item";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export const Navbar = () => {
  return (
    <div className="h-16 w-full px-10 bg-transparent flex items-center">
      <div className="md:max-w-screen-2xl mx-auto flex items-center w-full justify-between gap-4">
        <Logo />

        <div className="flex-1 py-2 px-6">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem className="py-2 px-4">
                <NavItem href="/">Home</NavItem>
              </NavigationMenuItem>
              <NavigationMenuItem className="py-2 px-4">
                <NavItem href="/contact-us">Contact Us</NavItem>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="space-x-4 md:block md:w-auto flex items-center justify-between w-full">
          <Button variant="outline" asChild className="bg-transparent">
            <Link to="/sign-in">Login</Link>
          </Button>

          <Button asChild>
            <Link to="/sign-up">Sign up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
