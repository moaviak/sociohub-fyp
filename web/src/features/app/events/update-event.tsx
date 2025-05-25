import { useLocation, useNavigate, useParams } from "react-router";
import { EventForm } from "./components/event-form";
import { useGetEventByIdQuery } from "./api";
import { Event } from "@/types";
import { SpinnerLoader } from "@/components/spinner-loader";

export const UpdateEvent = () => {
  const { eventId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  // Use event from state if available, otherwise fetch from API
  const eventFromState = state?.event as Event | undefined;
  const { data: eventFromQuery, isLoading } = useGetEventByIdQuery(
    eventId || "",
    {
      skip: !!eventFromState,
    }
  );

  const event = eventFromState || eventFromQuery;

  if (!isLoading && (!event || "error" in event)) {
    return navigate(-1);
  }

  return (
    <div className="flex flex-col gap-y-6 h-full">
      <div>
        <h4 className="h4-semibold">Edit Event</h4>
        <p className="b3-regular">
          Fill in the details to organize your society's activity.
        </p>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <SpinnerLoader size="lg" />
        </div>
      ) : (
        <EventForm event={event as Event} />
      )}
    </div>
  );
};
