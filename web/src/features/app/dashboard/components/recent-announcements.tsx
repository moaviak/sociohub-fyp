import { Button } from "@/components/ui/button";
import { useGetRecentAnnouncementsQuery } from "../../announcements/api";
import { AnnouncementCard } from "../../announcements/components/announcement-card";
import { Link } from "react-router";

export const RecentAnnouncements = () => {
  const { data, isLoading } = useGetRecentAnnouncementsQuery({ limit: 3 });

  const announcements = data && !("error" in data) ? data : [];

  return (
    <div className="w-full flex flex-col gap-y-4 p-4 bg-white drop-shadow-lg rounded-lg min-h-[448px]">
      <div className="flex justify-between items-center">
        <h5 className="h6-semibold">Recent Announcements</h5>

        <Button
          size={"sm"}
          variant={"link"}
          className="text-neutral-600"
          asChild
        >
          <Link to={"/explore#announcements"}>View more</Link>
        </Button>
      </div>
      <div className="flex-1">
        {isLoading ? (
          <>
            <AnnouncementCard.Skeleton />
            <AnnouncementCard.Skeleton />
            <AnnouncementCard.Skeleton />
          </>
        ) : (
          announcements.map((announcement) => (
            <AnnouncementCard announcement={announcement} variant="compact" />
          ))
        )}
      </div>
    </div>
  );
};
