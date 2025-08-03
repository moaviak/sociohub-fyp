import { SearchInput } from "@/components/search-input";
import { DataTable } from "@/components/ui/data-table";
import { transactionsColumns } from "./columns";
import { useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { useGetTransactionsQuery } from "./api";

export const Transactions: React.FC<{ societyId: string }> = ({
  societyId,
}) => {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSetSearch = useDebounceCallback(setSearch, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading, isFetching } = useGetTransactionsQuery({
    societyId,
    limit: pageSize,
    page,
    search,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  return (
    <div className="flex flex-col px-4 pt-4 min-h-0 max-h-full overflow-hidden w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-x-4 items-center">
          <p className="b1-semibold">Event Registrations Transactions</p>
        </div>
        <SearchInput
          placeholder="Search transaction"
          className="w-xs"
          value={input}
          onChange={handleInputChange}
          isSearching={!isLoading && isFetching}
        />
      </div>
      <div className="container mx-auto">
        <DataTable
          columns={transactionsColumns}
          data={data?.transactions || []}
          isLoading={isFetching}
          isPaginated
          isServerSide // Enable server-side pagination
          page={page}
          pageSize={pageSize}
          totalCount={data?.total || 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
};
