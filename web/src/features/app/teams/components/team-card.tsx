import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Eye, UserPlus, Crown } from "lucide-react";
import { Team } from "../types";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamOptions } from "./team-options";
import { haveTasksPrivilege, haveTeamsPrivilege } from "@/lib/utils";
import { useAppSelector } from "@/app/hooks";
import { Advisor } from "@/types";
import { Link } from "react-router";
import { toast } from "sonner";
import ApiError from "@/features/api-error";
import { useRequestToJoinTeamMutation } from "../api";

interface TeamCardProps {
  team: Team;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [requestToJoinTeam, { isLoading }] = useRequestToJoinTeamMutation();

  const isStudent = user && "registrationNumber" in user;
  const isAdvisor = team.societyId === (user as Advisor).societyId;

  const isTeamsPrivileged = isStudent
    ? haveTeamsPrivilege(user.societies || [], team.societyId)
    : isAdvisor;
  const isTasksPrivileged = isStudent
    ? haveTasksPrivilege(user.societies || [], team.societyId)
    : isAdvisor;

  const isMember = team.members.some(({ studentId }) => user?.id === studentId);
  const canJoin =
    isStudent &&
    !isMember &&
    !team.members.some(({ studentId }) => studentId === user?.id);

  const onJoinTeam = async () => {
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

  return (
    <Card className="group transition-all duration-300 border-0 shadow-md hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/50 gap-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-white shadow-md rounded-xl">
                <AvatarImage src={team.logo} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {team.name[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors cursor-context-menu">
                {team.name}
              </CardTitle>
            </div>
          </div>

          {(isTeamsPrivileged ||
            isTasksPrivileged ||
            (isMember && user?.id !== team.lead.id)) && (
            <TeamOptions
              team={team}
              haveTeamsPrivilege={isTeamsPrivileged}
              haveTasksPrivilege={isTasksPrivileged}
              isMember={isMember && user?.id !== team.lead.id}
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {team.description}
        </p>

        {/* Team Lead Section */}
        <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-8 w-8 ring-1 ring-white">
                <AvatarImage src={team.lead.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-medium">
                  {team.lead.firstName[0]}
                  {team.lead.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <Crown className="absolute -top-1 -right-1 h-3 w-3 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {team.lead.firstName} {team.lead.lastName}
              </p>
              <p className="text-xs text-gray-500 font-medium">Team Lead</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              <Users className="mr-1 h-3 w-3" />
              {team._count.members}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onJoinTeam()}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
            size="sm"
            disabled={!canJoin || isLoading}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Join Team
          </Button>

          <Button
            variant="outline"
            className="flex-1 border-gray-200 hover:bg-gray-50 text-primary-600! hover:border-gray-300 transition-all duration-200"
            size="sm"
            asChild
          >
            <Link to={`/team-detail/${team.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Team
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const TeamCardSkeleton: React.FC = () => {
  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-6 w-32 mb-1" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Team Lead Section Skeleton */}
        <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg border border-gray-100">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="flex-1 h-9 rounded" />
          <Skeleton className="flex-1 h-9 rounded" />
        </div>
      </CardContent>
    </Card>
  );
};
