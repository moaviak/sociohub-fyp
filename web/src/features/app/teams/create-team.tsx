import { TeamForm } from "./team-form";
import { Team } from "./types";

export const CreateTeam: React.FC<{ societyId: string; team?: Team }> = ({
  societyId,
  team,
}) => {
  return (
    <div className="flex flex-col gap-y-3 h-full">
      <h4 className="h4-semibold">{team ? "Edit Team" : "Create New Team"}</h4>
      <TeamForm societyId={societyId} team={team} />
    </div>
  );
};
