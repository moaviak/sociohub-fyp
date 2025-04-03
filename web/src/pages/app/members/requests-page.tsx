import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import JoinRequests from "@/features/app/members/join-requests";
import { Link, useParams } from "react-router";

function RequestsPage() {
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
            <BreadcrumbPage className="text-primary-600 b3-medium">
              Requests
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h4 className="h4-semibold">Members Requests</h4>
        <p className="b3-regular">Approve or deny the society join requests.</p>
      </div>
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <JoinRequests />
      </div>
    </div>
  );
}
export default RequestsPage;
