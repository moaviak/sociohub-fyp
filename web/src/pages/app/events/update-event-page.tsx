import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { UpdateEvent } from "@/features/app/events/update-event";
import { Link, useParams } from "react-router";

const UpdateEventPage = () => {
  const { societyId } = useParams();

  return (
    <div className="flex flex-col px-4 py-2 gap-y-4 h-full">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              className="text-primary-400 hover:text-primary-600 b3-medium"
              asChild
            >
              <Link to={societyId ? `/events/${societyId}` : "/events"}>
                Events
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-primary-600" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-primary-600 b3-medium">
              Update Event
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <UpdateEvent />
    </div>
  );
};
export default UpdateEventPage;
