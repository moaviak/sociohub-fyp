import { TeamDetail } from "@/features/app/teams/team-detail";
import { Navigate, useParams } from "react-router";

const TeamDetailPage = () => {
  const { teamId } = useParams();

  if (!teamId) {
    return <Navigate to="/dashboard" />;
  }

  return <TeamDetail teamId={teamId} />;
};
export default TeamDetailPage;
