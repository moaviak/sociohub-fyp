import { Skeleton } from "@/components/ui/skeleton";
import { Advisor, Announcement } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { AnnouncementOptions } from "./announcement-options";
import { useAppSelector } from "@/app/hooks";
import { haveAnnouncementsPrivilege } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface AnnouncementCardProps {
  announcement: Announcement;
  variant?: "default" | "compact";
}

export const AnnouncementCard = ({
  announcement,
  variant = "default",
}: AnnouncementCardProps) => {
  const { society, title, content, createdAt, publishDateTime } = announcement;
  const { user } = useAppSelector((state) => state.auth);

  const isStudent = user && "registrationNumber" in user;
  const havePrivilege = isStudent
    ? haveAnnouncementsPrivilege(
        user.societies || [],
        announcement.society?.id || ""
      )
    : announcement.societyId === (user as Advisor).societyId;

  // See more/less logic
  const [expanded, setExpanded] = useState(false);
  const [showSeeMore, setShowSeeMore] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // Check if content overflows N lines
      const lineHeight = parseFloat(
        getComputedStyle(contentRef.current).lineHeight
      );
      const maxLines = variant === "compact" ? 3 : 5;
      const maxHeight = lineHeight * maxLines;
      setShowSeeMore(contentRef.current.scrollHeight > maxHeight + 2); // +2 for rounding
    }
  }, [content, variant]);

  return (
    <div className="bg-white rounded-xl drop-shadow-md p-3 lg:p-4 flex gap-2 sm:gap-3 w-full max-w-xl">
      <img
        src={society?.logo || "/assets/images/society-placeholder.png"}
        className="rounded-full w-10 h-10 sm:w-12 sm:h-12 md:w-13 md:h-13 flex-shrink-0"
        alt={society?.name || "Society logo"}
      />
      <div className="flex flex-col gap-2 sm:gap-3 py-1 sm:py-2 min-w-0 flex-1">
        <div className="flex gap-x-2 items-center flex-wrap">
          <p className="b3-medium text-neutral-900 truncate">
            {society?.name || "Unknown Society"}
          </p>
          <p className="b4-regular text-neutral-600 hidden sm:inline">.</p>
          <p className="b4-regular text-neutral-600 flex-1 min-w-0 truncate sm:flex-initial">
            {publishDateTime || createdAt
              ? formatDistanceToNow(publishDateTime || createdAt!, {
                  addSuffix: true,
                })
              : ""}
          </p>
          {havePrivilege && <AnnouncementOptions announcement={announcement} />}
        </div>
        <p className="b2-semibold text-neutral-900 break-words">{title}</p>
        <div
          ref={contentRef}
          className={`text-neutral-700 b3-regular whitespace-pre-line break-words transition-all duration-200 ${
            !expanded && showSeeMore
              ? variant === "compact"
                ? "line-clamp-3"
                : "line-clamp-5"
              : ""
          }`}
        >
          {content}
        </div>
        {showSeeMore && (
          <button
            className="text-primary-600 b4-medium mt-1 self-start hover:underline focus:outline-none"
            onClick={() => setExpanded((v) => !v)}
            type="button"
          >
            {expanded ? "See less" : "See more"}
          </button>
        )}
      </div>
    </div>
  );
};

AnnouncementCard.Skeleton = function () {
  return (
    <div className="bg-white rounded-xl drop-shadow-md p-4 sm:p-5 flex gap-2 sm:gap-3 w-full max-w-xl">
      <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 md:h-13 md:w-13 rounded-full flex-shrink-0" />
      <div className="flex flex-col gap-2 sm:gap-3 py-1 sm:py-2 flex-1 min-w-0">
        <Skeleton className="h-4 w-full max-w-[240px]" />
        <Skeleton className="h-5 w-full max-w-[280px]" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
};
