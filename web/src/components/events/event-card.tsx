import { Event, EventStatus, EventVisibility, UserType } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEventDateTime, haveEventsPrivilege } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { useAppSelector } from "@/app/hooks";
import { EventOptions } from "./event-options";
import { Link } from "react-router";

interface EventCardProps {
  event: Event;
  variant?: "default" | "compact";
  onRegister?: (eventId: string) => Promise<void>;
  onViewDetails?: () => void;
  isRegistering?: boolean;
  onDelete?: (eventId: string, societyId: string) => Promise<void>;
  isDeleting?: boolean;
}

export const EventCard = ({
  event,
  variant = "default",
  onRegister,
  onViewDetails,
  isRegistering = false,
  onDelete,
  isDeleting = false,
}: EventCardProps) => {
  const { userType, user } = useAppSelector((state) => state.auth);

  const deadlineDate = new Date(event.registrationDeadline || "");
  const now = new Date();

  const canRegister =
    userType === UserType.STUDENT &&
    event.visibility === EventVisibility.Publish &&
    event.registrationRequired &&
    now < deadlineDate &&
    event.status === EventStatus.Upcoming;

  const isStudent = user && "registrationNumber" in user;
  const havePrivilege = isStudent
    ? haveEventsPrivilege(user.societies || [], event.societyId || "")
    : true;

  const handleClick = () => {
    if (onRegister) onRegister(event.id);
  };

  return (
    <Card
      className={cn(
        "overflow-hidden border border-border/50 transition-all duration-300 hover:border-border/100 bg-white shadow-lg p-0 gap-0",
        variant === "compact" ? "w-full" : "w-full max-w-md"
      )}
    >
      {/* Header with image/banner */}
      <CardHeader className="p-0">
        <div
          className={cn(
            "relative overflow-hidden",
            variant === "compact" ? "h-40" : "h-52"
          )}
        >
          <img
            src={event.banner || "/assets/images/image-placeholder.png"}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent
        className={cn(
          "flex flex-col gap-4 flex-1",
          variant === "compact" ? "p-2" : "px-2 py-4"
        )}
      >
        {/* Title */}
        <div className="flex justify-between">
          {" "}
          <h3
            className={cn(
              "h6-semibold text-foreground/90 mr-2",
              variant === "compact" ? "text-lg" : "text-xl"
            )}
          >
            {event.title}
          </h3>
          {(havePrivilege ||
            (event.isRegistered && event.registration?.ticket)) && (
            <EventOptions
              variant={variant}
              event={event}
              onDelete={onDelete}
              isDeleting={isDeleting}
              havePrivilege={havePrivilege}
            />
          )}
        </div>
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {event.categories?.map((category, i) => (
            <Badge
              key={i}
              variant="outline"
              className="bg-neutral-100 border-neutral-400 text-neutral-400"
            >
              {category}
            </Badge>
          ))}
        </div>{" "}
        {/* Date & Time */}
        <div className="text-sm text-neutral-700">
          {event.startDate &&
            event.endDate &&
            event.startTime &&
            event.endTime && (
              <>
                {formatEventDateTime(
                  event.startDate,
                  event.endDate,
                  event.startTime,
                  event.endTime
                )}
              </>
            )}
        </div>
        {/* Location */}
        {event.eventType === "Physical" ? (
          <div className="text-sm text-neutral-700 p-0">
            {event.venueName}
            {event.venueAddress && `, ${event.venueAddress}`}
          </div>
        ) : (
          <div className="text-sm text-neutral-700">
            Online via {event.platform}
          </div>
        )}
        {havePrivilege && event.visibility && event.visibility === "Draft" ? (
          <Badge
            variant={"outline"}
            className="bg-yellow-100 border-yellow-400 text-yellow-600"
          >
            Draft
          </Badge>
        ) : (
          event.status && (
            <Badge
              variant="outline"
              className={cn(
                event.status === EventStatus.Ongoing &&
                  "bg-secondary-100 border-secondary-400 text-secondary-600",
                event.status === EventStatus.Upcoming &&
                  "bg-accent-100 border-accent-400 text-accent-600",
                event.status === EventStatus.Completed &&
                  "bg-emerald-100 border-emerald-400 text-emerald-500",
                event.status === EventStatus.Cancelled &&
                  "bg-red-100 border-red-400 text-red-500"
              )}
            >
              {event.status}
            </Badge>
          )
        )}
      </CardContent>

      {/* Footer with buttons */}
      <CardFooter
        className={cn(
          "flex flex-col gap-2 w-full",
          variant === "compact" ? "p-2 pt-0" : "px-2 py-4 pt-0"
        )}
      >
        {canRegister && !event.isRegistered && (
          <Button
            onClick={handleClick}
            className="w-full"
            variant="default"
            disabled={isRegistering}
          >
            Register Now
          </Button>
        )}
        <Button
          onClick={onViewDetails}
          className="w-full"
          variant="outline"
          asChild
        >
          <Link to={`/event/${event.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

EventCard.Skeleton = function EventCardSkeleton() {
  return (
    <div className="flex flex-col rounded-md shadow-lg bg-white">
      <Skeleton className="h-52 w-full" />
      <div className="flex flex-col gap-y-2 px-2 py-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-14 w-full rounded-lg " />
      </div>
    </div>
  );
};
