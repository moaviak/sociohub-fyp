import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Team } from "../types";
import { Calendar, Crown, LogOut, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";
import { useAppSelector } from "@/app/hooks";

import { toast } from "sonner";
import { useLeaveTeamMutation, useRequestToJoinTeamMutation } from "../api";
import ApiError from "@/features/api-error";
import { TeamOptions } from "./team-options";
import { haveTasksPrivilege, haveTeamsPrivilege } from "@/lib/utils";
import { Advisor } from "@/types";

export const TeamDetailHeader: React.FC<{ team: Team }> = ({ team }) => {
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const [requestToJoinTeam, { isLoading: isJoinLoading }] =
    useRequestToJoinTeamMutation();
  const [leaveTeam, { isLoading: isLeaveLoading }] = useLeaveTeamMutation();

  const isAdvisor = user && "societyId" in user;
  const isMember = team.members.some(({ studentId }) => user?.id === studentId);
  const isLead = user?.id === team.lead.id;
  const canJoin =
    !isAdvisor &&
    !isMember &&
    !team.members.some(({ studentId }) => studentId === user?.id);

  const isStudent = user && "registrationNumber" in user;
  const isTeamsPrivileged = isStudent
    ? haveTeamsPrivilege(user.societies || [], team.societyId)
    : team.societyId === (user as Advisor).societyId;
  const isTasksPrivileged = isStudent
    ? haveTasksPrivilege(user.societies || [], team.societyId)
    : team.societyId === (user as Advisor).societyId;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleJoinTeam = async () => {
    try {
      await requestToJoinTeam({
        teamId: team.id,
        studentId: user?.id as string,
      }).unwrap();
      toast.success("Join request sent successfully!");
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Failed to send join request";
      toast.error(message);
    }
  };

  const handleLeaveTeam = async () => {
    try {
      await leaveTeam({ teamId: team.id }).unwrap();
      toast.success("Successfully left the team");
      navigate(`/teams/${team.societyId}`);
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Failed to leave team";
      toast.error(message);
    }
  };

  return (
    <div className="relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl"></div>
      <div
        className="absolute inset-0 opacity-5 rounded-2xl"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative border-0 bg-white/80 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            {/* Left Side - Team Info */}
            <div className="flex-1 space-y-6">
              {/* Team Logo and Name */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25"></div>
                  <Avatar className="relative h-20 w-20 ring-4 ring-white shadow-lg rounded-xl">
                    <AvatarImage src={team.logo} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                      {team.name[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                    {team.name}
                  </h1>

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created {formatDate(team.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <p className="text-lg text-gray-700 leading-relaxed max-w-3xl">
                  {team.description}
                </p>
              </div>

              {/* Team Lead and Members */}
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Team Lead */}
                <Link to={`/profile/${team.lead.id}`}>
                  <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="relative">
                      <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
                        <AvatarImage src={team.lead.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-semibold">
                          {team.lead.firstName![0]}
                          {team.lead.lastName![0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                        <Crown className="h-3 w-3 text-amber-500" />
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">
                        {team.lead.firstName} {team.lead.lastName}
                      </p>
                      <p className="text-sm text-amber-700 font-medium">
                        Team Lead
                      </p>
                      {team.lead.email && (
                        <p className="text-xs text-gray-600 mt-1">
                          {team.lead.email}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Members Count */}
                <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center justify-center h-12 w-12 bg-blue-100 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>

                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {team._count.members}
                    </p>
                    <p className="text-sm text-blue-700 font-medium">
                      {team._count.members === 1 ? "Member" : "Members"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className="flex-shrink-0 flex items-center">
              <div className="flex flex-col gap-y-3 p-3">
                {isAdvisor || !isMember ? (
                  <Button
                    size="lg"
                    disabled={!canJoin || isJoinLoading}
                    onClick={handleJoinTeam}
                  >
                    <UserPlus className="mr-2 size-5" />
                    Join Team
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="destructive"
                    disabled={isLead || isLeaveLoading}
                    onClick={handleLeaveTeam}
                  >
                    <LogOut className="mr-2 size-5" />
                    {isLeaveLoading ? "Leaving..." : "Leave Team"}
                  </Button>
                )}
              </div>
              {(isTeamsPrivileged || isTasksPrivileged) && (
                <TeamOptions
                  team={team}
                  isMember={isMember}
                  size="md"
                  haveTasksPrivilege={isTasksPrivileged}
                  haveTeamsPrivilege={isTeamsPrivileged}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
