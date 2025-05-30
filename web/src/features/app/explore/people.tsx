import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { SearchInput } from "@/components/search-input";
import { useGetAllUsersInfiniteQuery } from "./api";
import { DataTable } from "@/components/ui/data-table";
import { usersColumns } from "./columns";
import { Loader2 } from "lucide-react";
import { useDebounceCallback } from "usehooks-ts";

const People = () => {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSetSearch = useDebounceCallback(setSearch, 300);

  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetAllUsersInfiniteQuery({ limit: 20, search });

  // Set up intersection observer for the loader
  const { ref: loaderRef, inView } = useInView({
    threshold: 0,
    rootMargin: "100px", // Trigger 100px before the loader becomes visible
  });

  // Fetch next page when loader comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const users =
    data?.pages.flat().flatMap((user) => {
      if (!("error" in user)) return user.users;
      else return [];
    }) ?? [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  return (
    <div className="flex flex-col px-4 pt-4 gap-4 w-full">
      <SearchInput
        placeholder="Search member"
        className="w-md"
        value={input}
        onChange={handleInputChange}
        isSearching={!isLoading && isFetching}
      />

      <div className="container mx-auto overflow-y-auto custom-scrollbar">
        <DataTable columns={usersColumns} data={users} isLoading={isLoading} />
      </div>

      {/* Loader that triggers infinite scroll */}
      {hasNextPage && (
        <div ref={loaderRef} className="w-full py-4">
          <Loader2 className="mx-auto animate-spin text-neutral-600 w-6 h-6" />
        </div>
      )}

      {/* Optional: Show when fetching next page */}
      {isFetchingNextPage && (
        <div className="w-full py-2">
          <div className="text-center text-sm text-neutral-500">
            Loading more users...
          </div>
        </div>
      )}
    </div>
  );
};

export default People;
