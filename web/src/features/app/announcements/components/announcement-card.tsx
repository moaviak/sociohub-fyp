import { Skeleton } from "@/components/ui/skeleton";
import { Announcement } from "@/types";
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
  const { society, title, content, createdAt } = announcement;
  const { user } = useAppSelector((state) => state.auth);

  const isStudent = user && "registrationNumber" in user;
  const havePrivilege = isStudent
    ? haveAnnouncementsPrivilege(
        user.societies || [],
        announcement.society?.id || ""
      )
    : true;

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
    <div className="bg-white rounded-xl drop-shadow-md p-5 flex gap-2 max-w-xl w-full">
      <img
        src={society?.logo || "/assets/images/society-placeholder.png"}
        className="rounded-full w-13 h-13"
      />
      <div className="flex flex-col gap-3 py-2">
        <div className="flex gap-x-2 items-center">
          <p className="b3-medium text-neutral-900">
            {society?.name || "Unknown Society"}
          </p>
          <p className="b4-regular text-neutral-600">.</p>
          <p className="b4-regular text-neutral-600 flex-1">
            {createdAt
              ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
              : ""}
          </p>
          {havePrivilege && <AnnouncementOptions announcement={announcement} />}
        </div>
        <p className="b2-semibold text-neutral-900">{title}</p>
        <div
          ref={contentRef}
          className={`text-neutral-700 b3-regular whitespace-pre-line transition-all duration-200 ${
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
    <div className="bg-white rounded-xl drop-shadow-md p-5 flex gap-2 max-w-xl w-full">
      <Skeleton className="h-13 w-13 rounded-full" />
      <div className="flex flex-col gap-3 py-2">
        <Skeleton className="h-4 w-60" />
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-16 w-96" />
      </div>
    </div>
  );
};
