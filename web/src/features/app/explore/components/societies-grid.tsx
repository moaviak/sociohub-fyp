import { Society } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

import { SocietyTile } from "./society-tile";

interface SocietiesGridProps {
  societies: Society[];
}

export const SocietiesGrid = ({ societies }: SocietiesGridProps) => {
  return (
    <div className="grid grid-cols-3 py-6 gap-4 overflow-y-auto custom-scrollbar">
      {societies.map((society) => (
        <SocietyTile key={society.id} society={society} />
      ))}
    </div>
  );
};

SocietiesGrid.Skeleton = function SocietiesGridSkeleton() {
  return <Skeleton className="w-20 h-10" />;
};
