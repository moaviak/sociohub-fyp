import useGetSocietyId from "@/hooks/useGetSocietyId";
import { AnnouncementForm } from "./components/announcement-form";

export const CreateAnnouncement = () => {
  const societyId = useGetSocietyId();

  if (!societyId) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-6 h-full">
      <div>
        <h4 className="h4-semibold">Create New Announcement</h4>
        <p className="b3-regular">
          Create and manage important updates for your society members.
        </p>
      </div>

      <AnnouncementForm societyId={societyId} />
    </div>
  );
};
