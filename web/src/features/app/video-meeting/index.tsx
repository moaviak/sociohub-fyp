import useGetSocietyId from "@/hooks/useGetSocietyId";
import { useGetMyMeetingsQuery } from "./api";
import { DataTable } from "@/components/ui/data-table";
import { meetingsColumns } from "./columns";
import { useMeeting } from "@/contexts/meeting-context";
import { MeetingModal } from "./components/meeting-modal";

export const VideoMeeting = () => {
  const societyId = useGetSocietyId();
  const { data, isLoading } = useGetMyMeetingsQuery({
    societyId: societyId || "",
  });
  const { isMeetingModalOpen, hideMeetingModal, reset } = useMeeting();

  const meetings = data && !("error" in data) ? data : [];

  const handleCloseModal = () => {
    hideMeetingModal();
    reset();
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <DataTable
        data={meetings}
        columns={meetingsColumns}
        isLoading={isLoading}
      />
      <MeetingModal open={isMeetingModalOpen} onClose={handleCloseModal} />
    </div>
  );
};
