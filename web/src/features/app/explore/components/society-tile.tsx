import { Button } from "@/components/ui/button";
import { Society } from "@/types";

interface SocietyProps {
  society: Society;
}

export const SocietyTile = ({ society }: SocietyProps) => {
  return (
    <div className="flex flex-col items-center text-center p-4 gap-y-4">
      <img
        src={society.logo || "/assets/images/society-placeholder.png"}
        className="rounded-full w-12 h-12"
      />
      <div className="space-y-2 flex-1 overflow-hidden max-h-80">
        <h6 className="h6-semibold">{society.name}</h6>
        <p className="b3-regular overflow-ellipsis line-clamp-5">
          {society.description}
        </p>
      </div>
      <Button className="w-full">Join</Button>
    </div>
  );
};
