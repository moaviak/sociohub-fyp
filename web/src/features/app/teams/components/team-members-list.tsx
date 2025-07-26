import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { Team } from "../types";
import { RequestsModal } from "./requests-modal";
import { AddMemberModal } from "./add-member-modal";
import { MemberCard } from "./member-card";

interface TeamMembersListProps {
  team: Team;
  isLead?: boolean;
  requests?: number;
}

export const TeamMembersList: React.FC<TeamMembersListProps> = ({
  team,
  isLead = false,
  requests = 0,
}) => {
  // Sort members: leaders first, then by join date
  const sortedMembers = [...team.members].sort((a, b) => {
    if (a.studentId === team.leadId && b.studentId !== team.leadId) return -1;
    if (b.studentId === team.leadId && a.studentId !== team.leadId) return 1;
    return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
  });

  return (
    <Card className="border-0 shadow-md gap-y-2">
      {/* Header */}
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="h6-bold text-gray-900">Team Members</h2>
          </div>

          {/* Action Buttons */}
          {isLead && (
            <div className="flex gap-2">
              <RequestsModal teamId={team.id} requestsCount={requests} />

              <AddMemberModal team={team}>
                <Button size="sm">
                  <UserPlus className="mr-1 h-4 w-4" />
                  Add Member
                </Button>
              </AddMemberModal>
            </div>
          )}
        </div>
      </CardHeader>

      {/* Members List */}
      <CardContent className="p-0">
        {team.members.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No members yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start building your team by adding members.
            </p>
            {isLead && (
              <AddMemberModal team={team}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add First Member
                </Button>
              </AddMemberModal>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedMembers.map((member) => (
              <MemberCard
                key={member.studentId}
                member={member}
                teamId={team.id}
                isLead={member.studentId === team.leadId}
                leadId={team.leadId}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
