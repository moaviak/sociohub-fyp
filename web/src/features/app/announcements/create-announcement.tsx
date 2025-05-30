import { AnnouncementForm } from "./announcement-form";

export const CreateAnnouncement = () => {
  return (
    <div className="flex flex-col gap-y-6 h-full">
      <div>
        <h4 className="h4-semibold">Create New Announcement</h4>
        <p className="b3-regular">
          Create and manage important updates for your society members.
        </p>
      </div>

      <AnnouncementForm />
    </div>
  );
};
