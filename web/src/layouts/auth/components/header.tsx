import { Link } from "react-router";

import { Logo } from "@/components/logo";

export const Header = () => {
  return (
    <div className="h-16 w-full px-10 bg-transparent flex items-center justify-between">
      <Logo />
      <p className="b3-medium">
        Need Help?
        <Link to="/contact-us" className="text-primary-600 ml-2">
          Contact Us
        </Link>
      </p>
    </div>
  );
};
