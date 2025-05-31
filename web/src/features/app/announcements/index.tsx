import useGetSocietyId from "@/hooks/useGetSocietyId";
import { useGetSocietyAnnouncementsQuery } from "./api";
import { AnnouncementCard } from "./components/announcement-card";

export const Announcements = () => {
  const societyId = useGetSocietyId();
  const { data, isLoading } = useGetSocietyAnnouncementsQuery({
    societyId: societyId || "",
  });

  if (!societyId) {
    return null;
  }
  const announcements = data && !("error" in data) ? data : [];

  return (
    <div className="grid md:grid-cols-2 gap-4 p-4">
      {isLoading ? (
        <>
          <AnnouncementCard.Skeleton />
          <AnnouncementCard.Skeleton />
          <AnnouncementCard.Skeleton />
        </>
      ) : (
        announcements.map((announcement) => (
          <AnnouncementCard key={announcement.id} announcement={announcement} />
        ))
      )}
    </div>
  );
};
