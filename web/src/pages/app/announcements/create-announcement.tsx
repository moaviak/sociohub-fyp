import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CreateAnnouncement } from "@/features/app/announcements/create-announcement";
import { Link, useParams } from "react-router";

const CreateAnnouncementPage = () => {
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
              <Link
                to={
                  societyId ? `/announcements/${societyId}` : "/announcements"
                }
              >
                Announcements
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-primary-600" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-primary-600 b3-medium">
              Create New Announcement
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <CreateAnnouncement />
    </div>
  );
};
export default CreateAnnouncementPage;
