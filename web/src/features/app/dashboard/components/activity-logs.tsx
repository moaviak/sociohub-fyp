import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { useGetActivityLogsQuery } from "../../api";
import { DataTable } from "@/components/ui/data-table";
import { miniActivityLogsColumns } from "../../society/columns";

export const ActivityLogs: React.FC<{ societyId: string }> = ({
  societyId,
}) => {
  const { data, isLoading } = useGetActivityLogsQuery({
    societyId,
    limit: 5,
  });

  return (
    <div className="w-full flex flex-col gap-y-4 p-4 bg-white drop-shadow-lg rounded-lg min-h-[400px]">
      <div className="flex justify-between items-center">
        <h5 className="h6-semibold">Recent Activities</h5>

        <Button
          size={"sm"}
          variant={"link"}
          className="text-neutral-600"
          asChild
        >
          <Link to={"/activity-logs"}>View more</Link>
        </Button>
      </div>
      <DataTable
        columns={miniActivityLogsColumns}
        data={data?.activityLogs || []}
        isLoading={isLoading}
      />
    </div>
  );
};
