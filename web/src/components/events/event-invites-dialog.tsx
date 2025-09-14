import React, { useState } from "react";

import { Event, Student } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchInput } from "../search-input";
import { useGetSocietyMembersQuery } from "@/features/app/members/api";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Checkbox } from "../ui/checkbox";
import { useDebounceValue } from "usehooks-ts";
import { Button } from "../ui/button";
import { useGetStudentsQuery } from "@/features/app/api";
import { useInviteStudentsMutation } from "@/features/app/events/api";
import ApiError from "@/features/api-error";
import { toast } from "sonner";

export const EventInvitesDialog: React.FC<{
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ event, open, onOpenChange }) => {
  const [selectedStudents, setSelectedStudents] = useState<string[]>(
    event.eventInvitations ? event.eventInvitations.map((i) => i.studentId) : []
  );
  const [search, setSearch] = useState("");

  const [debouncedQuery] = useDebounceValue(search, 500);

  const { data } = useGetSocietyMembersQuery({
    societyId: event.societyId!,
    search: "",
  });
  const members = data && !("error" in data) ? data : [];

  const { data: students, isFetching } = useGetStudentsQuery(
    { search: debouncedQuery },
    { skip: !debouncedQuery }
  );

  const [inviteStudents, { isLoading }] = useInviteStudentsMutation();

  const toggleStudentSelection = (student: Student) => {
    setSelectedStudents((prev) =>
      prev.find((u) => u === student.id)
        ? prev.filter((u) => u !== student.id)
        : [...prev, student.id]
    );
  };

  const handleInvites = async () => {
    try {
      await inviteStudents({
        societyId: event.societyId!,
        eventId: event.id,
        studentIds: selectedStudents,
      }).unwrap();

      toast.success("Invitations successfully sent.");
      onOpenChange(false);
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Unexpected error occurred";

      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] overflow-x-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Invite Students</DialogTitle>
          <DialogDescription>
            Search and select the students below to invite them in event.
          </DialogDescription>
        </DialogHeader>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students..."
          className="w-full"
          isSearching={isFetching}
        />
        {!students && (
          <p className="text-sm text-muted-foreground">Suggested</p>
        )}
        <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1">
          {!students
            ? members.map((member) => (
                <RenderStudent
                  key={member.id}
                  student={member}
                  isChecked={selectedStudents.some((u) => u === member.id)}
                  handleCheckedChange={toggleStudentSelection}
                />
              ))
            : students.map((student) => (
                <RenderStudent
                  key={student.id}
                  student={student}
                  isChecked={selectedStudents.some((u) => u === student.id)}
                  handleCheckedChange={toggleStudentSelection}
                />
              ))}
        </div>

        <div className="border-t">
          <Button
            size="lg"
            className="w-full"
            disabled={selectedStudents.length === 0 || isLoading}
            onClick={handleInvites}
          >
            {isLoading ? "Sending..." : "Send Invites"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const RenderStudent: React.FC<{
  student: Student;
  isChecked: boolean;
  handleCheckedChange: (student: Student) => void;
}> = ({ student, isChecked, handleCheckedChange }) => {
  return (
    <div
      className="flex items-center gap-x-4 px-4 cursor-pointer"
      onClick={() => handleCheckedChange(student)}
    >
      <Avatar className="size-10 cursor-pointer">
        <AvatarImage src={student.avatar} className="object-cover" />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
          {student.firstName![0]}
          {student.lastName![0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p>
          {student.firstName} {student.lastName}
        </p>
        <p className="text-sm text-muted-foreground">
          {student.registrationNumber}
        </p>
      </div>
      <Checkbox
        className="rounded-full size-5 cursor-pointer data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
        checked={isChecked}
        onClick={(e) => e.stopPropagation()}
        onCheckedChange={() => handleCheckedChange(student)}
      />
    </div>
  );
};
