import { Link, useParams } from "react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { RequestsHistory } from "@/features/app/members/requests-history";

const RequestsHistoryPage = () => {
  const { societyId } = useParams();

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
            <BreadcrumbLink
              className="text-primary-400 hover:text-primary-600 b3-medium"
              asChild
            >
              <Link
                to={
                  societyId
                    ? `/members/${societyId}/requests`
                    : "/members/requests"
                }
              >
                Requests
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-primary-600" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-primary-600 b3-medium">
              History
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h4 className="h4-semibold">Members Requests History</h4>
        <p className="b3-regular">
          View all the previous 30 days join requests.
        </p>
      </div>
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <RequestsHistory />
      </div>
    </div>
  );
};
export default RequestsHistoryPage;
