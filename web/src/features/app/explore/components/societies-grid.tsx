import { SocietyTile } from "./society-tile";
import { type Societies } from "../types";

interface SocietiesGridProps {
  societies: Societies;
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
  return (
    <div className="grid grid-cols-3 py-6 gap-4 overflow-y-auto custom-scrollbar">
      <SocietyTile.Skeleton />
      <SocietyTile.Skeleton />
      <SocietyTile.Skeleton />
    </div>
  );
};
