import Explore from "@/features/app/explore";

function ExplorePage() {
  return (
    <div className="flex flex-col px-4 py-2">
      <h3 className="h3-semibold">
        Explore <span className="text-primary-600">SocioHub</span>
      </h3>
      <div className="flex-1">
        <Explore />
      </div>
    </div>
  );
}
export default ExplorePage;
