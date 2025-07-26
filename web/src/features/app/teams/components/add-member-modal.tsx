import { ReactNode, useState } from "react";
import { Team } from "../types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGetSocietyMembersQuery } from "../../members/api";
import { useDebounceValue } from "usehooks-ts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Member } from "@/types";
import { SearchInput } from "@/components/search-input";
import { Button } from "@/components/ui/button";
import { useAddTeamMembersMutation } from "../api";
import { toast } from "sonner";
import ApiError from "@/features/api-error";

export const AddMemberModal: React.FC<{ team: Team; children?: ReactNode }> = ({
  team,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const [debouncedQuery] = useDebounceValue(search, 500);

  const { data, isFetching } = useGetSocietyMembersQuery({
    societyId: team.societyId,
    search: debouncedQuery,
  });
  const members = data && !("error" in data) ? data : [];

  const toggleMemberSelection = (member: Member) => {
    setSelectedMembers((prev) =>
      prev.find((u) => u === member.id)
        ? prev.filter((u) => u !== member.id)
        : [...prev, member.id]
    );
  };

  const isAlreadyMember = (member: Member) => {
    return team.members.some((m) => m.studentId === member.id);
  };

  const [addTeamMembers, { isLoading }] = useAddTeamMembersMutation();

  const handleAddMembers = async () => {
    try {
      await addTeamMembers({
        teamId: team.id,
        studentIds: selectedMembers,
      }).unwrap();

      setSelectedMembers([]);
      setIsOpen(false);
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Failed to add members";
      toast.error(message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>
            Add new members to the {team.name}.
          </DialogDescription>
        </DialogHeader>

        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members..."
          className="w-full"
          isSearching={isFetching}
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
          {members.map((member) => {
            const alreadyMember = isAlreadyMember(member);

            return (
              <div
                key={member.id}
                className={`px-4 flex gap-x-3 items-center py-2 rounded-md ${
                  alreadyMember
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-primary-600/10"
                }`}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {member.firstName?.[0]}
                    {member.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">
                    {member.firstName} {member.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {alreadyMember ? "Already in team" : member.email}
                  </p>
                </div>
                <Checkbox
                  className="rounded-full size-5 cursor-pointer data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
                  checked={selectedMembers.some((u) => u === member.id)}
                  onCheckedChange={() => toggleMemberSelection(member)}
                  disabled={alreadyMember}
                />
              </div>
            );
          })}
        </div>

        <div className="border-t">
          <Button
            size="lg"
            className="w-full"
            disabled={selectedMembers.length === 0 || isLoading}
            onClick={handleAddMembers}
          >
            {!isLoading
              ? `Add To Team (${selectedMembers.length})`
              : "Adding..."}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
