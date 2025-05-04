import { History } from "lucide-react";
import { Link, Outlet, useLocation, useParams } from "react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import JoinRequests from "@/features/app/members/join-requests";
import { Button } from "@/components/ui/button";

function RequestsPage() {
  const { societyId } = useParams();
  const location = useLocation();

  if (location.pathname.endsWith("/history")) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col px-4 py-2 max-h-full overflow-hidden gap-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              className="text-primary-400 hover:text-primary-600 b3-medium"
              asChild
            >
              <Link to={societyId ? `/members/${societyId}` : "/members"}>
                Members
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-primary-600" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-primary-600 b3-medium">
              Requests
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="h4-semibold">Members Requests</h4>
          <p className="b3-regular">
            Approve or deny the society join requests.
          </p>
        </div>
        <Button variant="outline" className="group" asChild>
          <Link
            to={`/members/${
              societyId ? `${societyId}/requests/history` : "requests/history"
            }`}
          >
            <History className="text-primary-600 w-5 h-5 group-hover:text-white" />
            Requests History
          </Link>
        </Button>
      </div>
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <JoinRequests />
      </div>
    </div>
  );
}
export default RequestsPage;
