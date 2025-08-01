import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useLazySearchUsersQuery,
  useGetSuggestedUsersQuery,
  useAddParticipantsMutation,
} from "../api";
import { useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { User } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Chat } from "../types";
import { toast } from "sonner";

interface AddMembersDialogProps {
  chat: Chat;
  children: React.ReactNode;
}

export const AddMembersDialog = ({ chat, children }: AddMembersDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebounceValue(searchQuery, 500);

  const [searchUsers, { data: users, isLoading }] = useLazySearchUsersQuery({
    selectFromResult: ({ data, ...params }) => {
      const participants = chat.participants.map(
        (participant) => participant.studentId || participant.advisorId
      );
      const result = data?.filter((user) => !participants.includes(user.id));
      return { data: result || [], ...params };
    },
  });
  const { data: suggestedUsers, isLoading: isLoadingSuggested } =
    useGetSuggestedUsersQuery();
  const [addParticipants, { isLoading: isAdding }] =
    useAddParticipantsMutation();

  useEffect(() => {
    if (debouncedQuery) {
      searchUsers(debouncedQuery);
    }
  }, [debouncedQuery, searchUsers]);

  const handleAddMembers = async () => {
    try {
      await addParticipants({
        chatId: chat.id,
        participantIds: selectedUsers.map((u) => u.id),
      }).unwrap();
      toast.success("Members added successfully");
      resetState();
    } catch (error) {
      toast.error("Failed to add members");
      console.error("Failed to add members:", error);
    }
  };

  const resetState = () => {
    setIsOpen(false);
    setSearchQuery("");
    setSelectedUsers([]);
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) =>
      prev.find((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    );
  };

  const existingParticipantIds = chat.participants.map((p) => p.id);

  const renderUserList = (userList: User[]) => {
    const filteredList = userList.filter(
      (u) => !existingParticipantIds.includes(u.id)
    );

    return filteredList.map((user) => (
      <div
        key={user.id}
        className="px-4 flex gap-x-3 items-center p-2 rounded-md cursor-pointer hover:bg-primary-600/10"
        onClick={() => toggleUserSelection(user)}
      >
        <Avatar className="h-9 w-9">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>
            {user.firstName?.[0]}
            {user.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Checkbox
          className="rounded-full size-5 cursor-pointer data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
          checked={selectedUsers.some((u) => u.id === user.id)}
          onCheckedChange={() => toggleUserSelection(user)}
        />
      </div>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="px-0">
        <DialogHeader>
          <DialogTitle className="text-center">Add Members</DialogTitle>
        </DialogHeader>
        <div className="px-4">
          <Input
            placeholder="Search users to add..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {searchQuery ? (
            <>
              {isLoading && <UserSkeletonList />}
              {users && renderUserList(users)}
            </>
          ) : (
            <>
              <p className="px-4 text-muted-foreground b2-medium">Suggested</p>
              {isLoadingSuggested && <UserSkeletonList />}
              {suggestedUsers &&
                renderUserList(
                  suggestedUsers.map((iUser) => iUser.advisor || iUser.student!)
                )}
            </>
          )}
        </div>
        <div className="px-4">
          <Button
            className="w-full"
            onClick={handleAddMembers}
            disabled={isAdding || selectedUsers.length === 0}
          >
            Add to Group
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const UserSkeleton = () => (
  <div className="px-4 flex items-center gap-x-2 p-2 rounded-md cursor-pointer hover:bg-primary-600/10">
    <Skeleton className="size-9 rounded-full" />
    <div className="flex-1 space-y-1">
      <Skeleton className="w-[120px] h-[22px]" />
      <Skeleton className="w-[220px] h-[18px]" />
    </div>
  </div>
);

const UserSkeletonList = () => (
  <>
    <UserSkeleton />
    <UserSkeleton />
    <UserSkeleton />
    <UserSkeleton />
    <UserSkeleton />
  </>
);
