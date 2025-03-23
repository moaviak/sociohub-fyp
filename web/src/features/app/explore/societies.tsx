import { Society } from "@/types";
import { useGetSocietiesQuery } from "./api";
import { EmptyState } from "./components/empty-state";
import { SearchInput } from "./components/search-input";
import { SocietiesGrid } from "./components/societies-grid";

const Societies = () => {
  const { data: societies, isLoading } = useGetSocietiesQuery();

  if (!isLoading && (!societies || "error" in societies)) {
    return (
      <EmptyState
        title="No societies found."
        label="If you believe this is an error, please try refreshing the page."
      />
    );
  }

  return (
    <div className="flex flex-col px-4 pt-4 min-h-0 max-h-full overflow-hidden">
      <div>
        <SearchInput placeholder="Search society" />
      </div>
      {isLoading ? (
        <SocietiesGrid.Skeleton />
      ) : (
        <SocietiesGrid societies={societies as Society[]} />
      )}
    </div>
  );
};
export default Societies;
