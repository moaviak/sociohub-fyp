import { Event } from "@/types";
import { useGetEventRegistrationsQuery } from "../api";
import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { registrationsColumns } from "../columns";

export const EventRegistrations: React.FC<{ event: Event }> = ({ event }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const { data, isFetching: isLoading } = useGetEventRegistrationsQuery({
    eventId: event.id,
    societyId: event.societyId!,
    limit: pageSize,
    page,
  });

  return (
    <div>
      <DataTable
        columns={registrationsColumns}
        data={data?.registrations || []}
        isLoading={isLoading}
        isPaginated
        isServerSide // Enable server-side pagination
        page={page}
        pageSize={pageSize}
        totalCount={data?.total || 0}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};
