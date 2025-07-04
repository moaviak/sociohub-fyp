import useGetSocietyId from "@/hooks/useGetSocietyId";
import { useGetMyMeetingsQuery } from "./api";
import { DataTable } from "@/components/ui/data-table";
import { meetingsColumns } from "./columns";

export const VideoMeeting = () => {
  const societyId = useGetSocietyId();
  const { data, isLoading } = useGetMyMeetingsQuery({
    societyId: societyId || "",
  });

  const meetings = data && !("error" in data) ? data : [];

  return (
    <div className="container mx-auto px-4 py-4">
      <DataTable
        data={meetings}
        columns={meetingsColumns}
        isLoading={isLoading}
      />
    </div>
  );
};
