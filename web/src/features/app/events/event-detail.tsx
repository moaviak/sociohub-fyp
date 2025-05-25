import DOMPurify from "dompurify";
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { SpinnerLoader } from "@/components/spinner-loader";

import { useGetEventByIdQuery } from "./api";
import { formatEventDateTime, getRegistrationStatus } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface EventDetailProps {
  eventId: string;
  societyId?: string;
}

export const EventDetail = ({ eventId, societyId }: EventDetailProps) => {
  const navigate = useNavigate();

  const { data: event, isLoading } = useGetEventByIdQuery(eventId);

  if (event && "error" in event) {
    navigate(-1);
    return null;
  }

  if (!isLoading && !event) {
    navigate(-1);
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <SpinnerLoader size="md" />
      </div>
    );
  }

  const registrationStatus = getRegistrationStatus(
    event?.registrationRequired || false,
    event?.registrationDeadline,
    event?.paidEvent || false
  );

  return (
    <div className="flex flex-col px-4 py-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h5 className="h5-semibold">{event?.title}</h5>
          <p className="b3-regular">{event?.tagline}</p>
        </div>
        <div className="space-x-4">
          <Button>Edit Event</Button>
          <Button variant="outline">Manage Registration</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left/Main Content */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {/* Event Image */}
          <div className="w-full aspect-[4/3] bg-neutral-200 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={event?.banner || "/assets/image/image-placheholder.png"}
              className="w-full h-full object-contain object-center"
            />
          </div>
          {/* About this Event */}
          <div>
            <h3 className="h6-semibold mb-2">About this Event</h3>
            <div
              className="prose max-w-none"
              // Use DOMPurify to sanitize HTML before rendering
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  event?.description || "Not provided"
                ),
              }}
            />
          </div>
        </div>
        {/* Right/Sidebar */}
        <div className="md:col-span-1 flex flex-col gap-4">
          {/* Event Information Summary */}
          <div className="bg-white rounded-lg shadow px-4 py-6 space-y-4">
            <h6 className="h6-semibold">Event Information Summary</h6>
            {event?.startDate &&
              event.startTime &&
              event.endDate &&
              event.endTime && (
                <div className="">
                  <span className="b2-semibold">Date & Time:</span>
                  <div className="b2-regular text-neutral-600">
                    {formatEventDateTime(
                      event.startDate,
                      event.endDate,
                      event.startTime,
                      event.endTime
                    )}
                  </div>
                </div>
              )}

            {event &&
              (event.eventType === "Physical" ? (
                <div className="space-y-2">
                  <span className="b2-semibold">Location:</span>
                  <div className="b2-regular text-neutral-600">
                    {event.venueName}
                  </div>
                  {event.venueAddress && (
                    <div className="b2-regular text-neutral-600">
                      {event.venueAddress}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="b2-semibold">Platform:</span>
                  <div className="b2-regular text-neutral-600">
                    Online via {event.platform}
                  </div>
                  {event.accessInstructions && (
                    <div className="b3-regular text-neutral-600">
                      Note: {event.accessInstructions}
                    </div>
                  )}
                </div>
              ))}

            {event?.categories && (
              <div className="">
                <span className="b2-semibold">Category:</span>
                <div className="flex flex-wrap gap-2 p-2">
                  {event.categories?.map((category, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="bg-neutral-100 border-neutral-400 text-neutral-400"
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {event?.society && (
              <div className="">
                <span className="b2-semibold">Society:</span>
                <div className="flex items-center gap-2 p-2">
                  {/* Placeholder for society logo */}
                  <img
                    src={
                      event.society.logo ||
                      "/assets/images/society-placholder.png"
                    }
                    className="w-12 h-12 rounded-full"
                  />
                  <span className="b2-medium text-neutral-600">
                    {event.society.name}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Registration Information */}
          <div className="bg-white rounded-lg shadow px-4 py-6 space-y-4">
            <h6 className="h6-semibold">Registration Information</h6>
            <div className="">
              <span className="b2-semibold">Status:</span>
              <div className="p-2">
                <Badge className="bg-primary-600 text-white">
                  {registrationStatus}
                </Badge>
              </div>
            </div>
            {registrationStatus !== "Not required" && (
              <>
                <div className="">
                  <span className="b2-semibold">Spots Left:</span>
                  {event?.maxParticipants ? (
                    <div className="b2-regular text-neutral-600">
                      {event.maxParticipants} out of {event.maxParticipants}
                      // TODO: Calculate proper spots
                    </div>
                  ) : (
                    <div className="b2-regular text-neutral-600">Unlimited</div>
                  )}
                </div>
                {event?.registrationDeadline && (
                  <div className="">
                    <span className="b2-semibold">Registration Deadline:</span>
                    <div className="b2-regular text-neutral-600">
                      {format(
                        new Date(event.registrationDeadline),
                        "EEE, MMM d | h:mm aa"
                      )}
                    </div>
                  </div>
                )}
                {registrationStatus === "Paid Event" && event?.ticketPrice && (
                  <div className="">
                    <span className="b2-semibold">Ticket Price:</span>
                    <div className="b2-regular text-neutral-600">
                      PKR {event.ticketPrice}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
