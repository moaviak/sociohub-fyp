import { useLocation, useNavigate, useParams } from "react-router";
import { useGetAnnouncementByIdQuery } from "./api";
import { Announcement } from "@/types";
import { SpinnerLoader } from "@/components/spinner-loader";
import { AnnouncementForm } from "./components/announcement-form";

export const EditAnnouncement = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const announcementFromState = state?.announcement as Announcement | undefined;
  const { data: announcementFromQuery, isLoading } =
    useGetAnnouncementByIdQuery(id || "", {
      skip: !!announcementFromState,
    });

  const announcement = announcementFromState || announcementFromQuery;

  if (!isLoading && (!announcement || "error" in announcement)) {
    navigate(-1);
    return null;
  }

  return (
    <div className="flex flex-col gap-y-6 h-full">
      <div>
        <h4 className="h4-semibold">Edit Event</h4>
        <p className="b3-regular">
          Create and manage important updates for your society members.
        </p>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <SpinnerLoader size="lg" />
        </div>
      ) : (
        <AnnouncementForm
          announcement={announcement as Announcement}
          societyId={(announcement as Announcement).societyId || ""}
        />
      )}
    </div>
  );
};
