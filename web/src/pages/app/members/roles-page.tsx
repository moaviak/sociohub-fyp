import { Link, useParams } from "react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Roles from "@/features/app/members/roles";

function RolesPage() {
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
              Roles
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Roles />
    </div>
  );
}
export default RolesPage;
