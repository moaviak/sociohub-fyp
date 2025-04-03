import { Link } from "react-router";

import { Button } from "@/components/ui/button";

function NotFoundPage() {
  return (
    <div className="w-full h-screen flex items-center justify-center flex-col gap-y-6">
      <img
        src="/assets/images/not-found.svg"
        alt="Not Found"
        className="w-sm"
      />
      <div className="text-center max-w-sm">
        <h4 className="h4-semibold text-primary-600">404 - PAGE NOT FOUND</h4>
        <p className="b3-regular text-primary-900">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
      </div>
      <Button size="lg" asChild>
        <Link to="/dashboard" replace>
          Go to dashbaord
        </Link>
      </Button>
    </div>
  );
}
export default NotFoundPage;
