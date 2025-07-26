import { useGetSocietyTeamsQuery } from "./api";
import { TeamCard, TeamCardSkeleton } from "./components/team-card";

export const Teams: React.FC<{ societyId: string }> = ({ societyId }) => {
  const { data: teams, isLoading } = useGetSocietyTeamsQuery(societyId);

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-4 p-4">
        <TeamCardSkeleton />
        <TeamCardSkeleton />
        <TeamCardSkeleton />
        <TeamCardSkeleton />
        <TeamCardSkeleton />
        <TeamCardSkeleton />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-4 p-4">
      {teams?.map((team) => (
        <TeamCard team={team} key={team.id} />
      ))}
    </div>
  );
};
