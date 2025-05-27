import { EventDetail } from "@/features/app/events/event-detail";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      navigate(-1);
    }
  }, [id, navigate]);

  if (!id) {
    // Show a loader or fallback UI while redirecting
    return null;
  }

  return <EventDetail eventId={id} />;
};
export default EventDetailPage;
