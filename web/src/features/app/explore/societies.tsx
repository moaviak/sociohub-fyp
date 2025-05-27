import { SearchInput } from "@/components/search-input";
import { useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

import { useGetSocietiesQuery } from "./api";
import { EmptyState } from "./components/empty-state";
import { SocietiesGrid } from "./components/societies-grid";
import { type Societies } from "./types";

const Societies = () => {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSetSearch = useDebounceCallback(setSearch, 300);

  const {
    data: societies,
    isFetching,
    isLoading,
  } = useGetSocietiesQuery({
    search,
  });

  if (!isLoading && (!societies || "error" in societies)) {
    return (
      <EmptyState
        title="No societies found."
        label="If you believe this is an error, please try refreshing the page."
      />
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  return (
    <div className="flex flex-col px-4 pt-4 min-h-0 max-h-full overflow-hidden">
      <div>
        <SearchInput
          placeholder="Search society"
          value={input}
          onChange={handleInputChange}
          isSearching={!isLoading && isFetching}
        />
      </div>
      {isLoading ? (
        <SocietiesGrid.Skeleton />
      ) : (
        <SocietiesGrid societies={societies as Societies} />
      )}
    </div>
  );
};
export default Societies;
