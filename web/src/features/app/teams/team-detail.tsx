import { SpinnerLoader } from "@/components/spinner-loader";
import { useGetTeamByIdQuery } from "./api";
import { TeamDetailHeader } from "./components/team-detail-header";
import { TeamMembersList } from "./components/team-members-list";
import { useAppSelector } from "@/app/hooks";
import { Advisor } from "@/types";
import { cn, haveTasksPrivilege, haveTeamsPrivilege } from "@/lib/utils";
import { TeamTasksList } from "./components/team-tasks-list";

export const TeamDetail: React.FC<{ teamId: string }> = ({ teamId }) => {
  const user = useAppSelector((state) => state.auth.user);
  const { data: team, isLoading } = useGetTeamByIdQuery(teamId);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <SpinnerLoader />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-gray-500">Team not found</p>
      </div>
    );
  }

  const isStudent = user && "registrationNumber" in user;
  const isTeamsPrivileged = isStudent
    ? haveTeamsPrivilege(user.societies || [], team.societyId)
    : team.societyId === (user as Advisor).societyId;
  const isTasksPrivileged = isStudent
    ? haveTasksPrivilege(user.societies || [], team.societyId)
    : team.societyId === (user as Advisor).societyId;
  const isPrivileged = isTeamsPrivileged || isTasksPrivileged;
  const isMember = team.members.some(({ studentId }) => user?.id === studentId);

  return (
    <div className="space-y-4 p-4">
      <TeamDetailHeader team={team} />
      <div
        className={cn(
          "grid gap-4",
          (isPrivileged || isMember) && "lg:grid-cols-2"
        )}
      >
        {(isPrivileged || isMember) && (
          <div>
            <TeamTasksList
              team={team}
              tasks={team.teamTasks || []}
              isLead={user?.id === team.lead.id}
            />
          </div>
        )}
        <div>
          <TeamMembersList
            team={team}
            isLead={user?.id === team.lead.id}
            requests={team._count.joinRequests}
          />
        </div>
      </div>
    </div>
  );
};
