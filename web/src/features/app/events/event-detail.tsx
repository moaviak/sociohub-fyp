import DOMPurify from "dompurify";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { SpinnerLoader } from "@/components/spinner-loader";

import {
  useDeleteEventMutation,
  useGetEventByIdQuery,
  useRegisterForEventMutation,
  useRejectInviteMutation,
} from "./api";
import {
  cn,
  formatEventDateTime,
  getRegistrationStatus,
  haveEventsPrivilege,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useAppSelector } from "@/app/hooks";
import {
  Advisor,
  EventAudience,
  EventStatus,
  EventVisibility,
  UserType,
} from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EventOptions } from "@/components/events/event-options";
import { CountdownTimer } from "./components/countdown-timer";
import { useCreateCheckoutSessionMutation } from "../payments/api";
import {
  generateCancelUrl,
  generateSuccessUrl,
  handleCheckoutError,
  logCheckoutEvent,
  redirectToCheckout,
  validateCheckoutResponse,
} from "@/lib/checkout-utils";
import ApiError from "@/features/api-error";

interface EventDetailProps {
  eventId: string;
}

export const EventDetail = ({ eventId }: EventDetailProps) => {
  const navigate = useNavigate();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const { data: event, isLoading: isFetchingEvent } =
    useGetEventByIdQuery(eventId);
  const [registerForEvent, { isLoading: isRegistering }] =
    useRegisterForEventMutation();
  const [createCheckoutSession, { isLoading: isCreatingCheckout }] =
    useCreateCheckoutSessionMutation();
  const [deleteEvent, { isLoading: isDeleting, isError: isDeleteError }] =
    useDeleteEventMutation();
  const [rejectInvite, { isLoading: isRejecting }] = useRejectInviteMutation();

  const { userType, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isDeleteError) {
      toast.error(
        "Unexpected error occurred while deleting. Please try again!"
      );
    }
  }, [isDeleteError]);

  // Handle event fetch error or missing event
  useEffect(() => {
    if (!isFetchingEvent && (!event || "error" in event)) {
      navigate(-1);
    }
  }, [isFetchingEvent, event, navigate]);

  // Check for payment cancellation in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentCancelled = urlParams.get("payment_cancelled");

    if (paymentCancelled === "true") {
      toast.info("Payment was cancelled. You can try again.");
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // Show loader while loading or redirecting
  if (isFetchingEvent || !event || "error" in event) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <SpinnerLoader size="md" />
      </div>
    );
  }

  const registrationStatus = getRegistrationStatus(
    event?.registrationRequired || false,
    event?.registrationDeadline,
    event?.paidEvent,
    event?.isRegistered
  );

  const deadlineDate = new Date(event?.registrationDeadline || "");
  const now = new Date();

  const canRegister =
    userType === UserType.STUDENT &&
    event.visibility === EventVisibility.Publish &&
    event?.registrationRequired &&
    now < deadlineDate &&
    event?.status === EventStatus.Upcoming;

  const isStudent = user && "registrationNumber" in user;
  const havePrivilege = isStudent
    ? haveEventsPrivilege(user.societies || [], event?.societyId || "")
    : event.societyId === (user as Advisor).societyId;

  const onRegister = async () => {
    if (!canRegister) return;

    setIsProcessingPayment(true);
    logCheckoutEvent("Registration started", { eventId: event.id });

    try {
      const registrationResponse = await registerForEvent(event.id).unwrap();

      if ("error" in registrationResponse) {
        throw new Error(registrationResponse.errorMessage);
      }

      // If payment is required, create checkout session
      if (registrationResponse.paymentRequired) {
        logCheckoutEvent("Payment required", {
          registrationId: registrationResponse.registration.id,
        });

        // Create checkout session
        const checkoutResponse = await createCheckoutSession({
          eventId: event.id,
          registrationId: registrationResponse.registration.id,
          successUrl: generateSuccessUrl(),
          cancelUrl: generateCancelUrl(event.id),
        }).unwrap();

        if (!validateCheckoutResponse(checkoutResponse)) {
          throw new Error("Invalid checkout response");
        }

        logCheckoutEvent("Checkout session created", {
          sessionId: checkoutResponse.sessionId,
        });

        // Redirect to Stripe Checkout
        redirectToCheckout(checkoutResponse.checkoutUrl);
      } else {
        // Free event - registration completed
        toast.success("Successfully registered for the event!");
        logCheckoutEvent("Free registration completed", {
          registrationId: registrationResponse.registration.id,
        });
      }
    } catch (error) {
      const errorMessage = handleCheckoutError(error);
      toast.error(errorMessage);
      logCheckoutEvent("Registration failed", { error: errorMessage });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const onDelete = async (eventId: string, societyId: string) => {
    const response = await deleteEvent({
      eventId,
      societyId,
    });

    if (!("error" in response)) {
      toast.success("Event successfully deleted.");
      navigate(-1);
    }
  };

  const handleRejection = async () => {
    try {
      await rejectInvite({ eventId }).unwrap();
      toast.success("Invitation rejected.");
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "An unexpected error occurred.";
      toast.error(message);
    }
  };

  const isLoading = isRegistering || isCreatingCheckout || isProcessingPayment;

  return (
    <div className="flex flex-col px-4 py-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h5 className="h5-semibold">{event?.title}</h5>
          <p className="b3-regular">{event?.tagline}</p>
        </div>
        <div className="flex items-center gap-x-2">
          {canRegister &&
            !event.isRegistered &&
            event.audience !== EventAudience.Invite && (
              <Button
                onClick={onRegister}
                className="w-full"
                variant="default"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isRegistering
                      ? "Registering..."
                      : isCreatingCheckout
                      ? "Creating Checkout..."
                      : "Processing..."}
                  </>
                ) : (
                  <>Register Now</>
                )}
              </Button>
            )}

          {!event.isRegistered && event.isInvited && (
            <div className="flex w-full gap-x-2">
              <Button
                variant={"success"}
                className="w-full"
                onClick={onRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    {isRegistering
                      ? "Registering..."
                      : isCreatingCheckout
                      ? "Creating Checkout..."
                      : "Processing..."}
                  </>
                ) : (
                  <>Accept Invitation</>
                )}
              </Button>
              <Button
                variant={"destructive"}
                className="w-full"
                onClick={handleRejection}
                disabled={isRejecting}
              >
                Reject Invitation
              </Button>
            </div>
          )}

          {event.isRegistered && (
            <Button variant="outline" className="w-full" disabled>
              Registered
            </Button>
          )}
          {(havePrivilege ||
            (event.isRegistered && event.registration?.ticket)) && (
            <EventOptions
              event={event}
              onDelete={onDelete}
              isDeleting={isDeleting}
              havePrivilege={havePrivilege}
            />
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left/Main Content */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {/* Event Image */}
          <div className="w-full aspect-[4/3] bg-black rounded-lg overflow-hidden flex items-center justify-center">
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
          {event.visibility === EventVisibility.Schedule &&
            event.publishDateTime && (
              <CountdownTimer targetDate={new Date(event.publishDateTime)} />
            )}
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

            {event.eventType &&
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

            {event.status && (
              <div className="">
                <span className="b2-semibold">Status:</span>
                <div className="flex flex-wrap gap-2 p-2">
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
                  {event?.maxParticipants && event?._count !== undefined ? (
                    <div className="b2-regular text-neutral-600">
                      {event.maxParticipants - event._count.eventRegistrations}{" "}
                      out of {event.maxParticipants}
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
