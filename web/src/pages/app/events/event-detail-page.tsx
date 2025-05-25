import { EventDetail } from "@/features/app/events/event-detail";
import { useNavigate, useParams } from "react-router";

const EventDetailPage = () => {
  const { societyId, eventId } = useParams();
  const navigate = useNavigate();

  if (!eventId) {
    navigate(-1);
    return null;
  }

  return <EventDetail eventId={eventId} societyId={societyId} />;
};
export default EventDetailPage;
