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
  useCreateOneToOneChatMutation,
  useGetSuggestedUsersQuery,
  useCreateGroupChatMutation,
} from "../api";
import { useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { User } from "@/types";
import { ArrowLeft, Edit, UsersRound } from "lucide-react";
import { useNavigate } from "react-router";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { PhotoUpload } from "@/components/photo-upload";

export const NewChatDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const [view, setView] = useState<"newMessage" | "newGroup">("newMessage");

  // State for one-on-one chat
  const [selectedUser, setSelectedUser] = useState<User>();

  // State for group chat
  const [groupName, setGroupName] = useState("");
  const [groupAvatar, setGroupAvatar] = useState<File>();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebounceValue(searchQuery, 500);

  const [searchUsers, { data: users, isLoading }] = useLazySearchUsersQuery();
  const { data: suggestedUsers, isLoading: isLoadingSuggested } =
    useGetSuggestedUsersQuery();
  const [createChat, { isLoading: isCreatingChat }] =
    useCreateOneToOneChatMutation();
  const [createGroup, { isLoading: isCreatingGroup }] =
    useCreateGroupChatMutation();

  useEffect(() => {
    if (debouncedQuery) {
      searchUsers(debouncedQuery);
    }
  }, [debouncedQuery, searchUsers]);

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      return;
    }

    try {
      const chat = await createGroup({
        name: groupName.trim(),
        participants: selectedUsers.map((u) => u.id),
        avatar: groupAvatar,
      }).unwrap();
      navigate(`/chats/${chat.id}`);
      resetState();
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const handleStartOneOnOneChat = async () => {
    if (!selectedUser) return;

    try {
      const chat = await createChat(selectedUser.id).unwrap();
      navigate(`/chats/${chat.id}`);
      resetState();
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  const resetState = () => {
    setIsOpen(false);
    setSearchQuery("");
    setSelectedUser(undefined);
    setSelectedUsers([]);
    setGroupName("");
    setGroupAvatar(undefined);
    setView("newMessage");
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) =>
      prev.find((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    );
  };

  const handleUserClick = (user: User) => {
    if (view === "newGroup") {
      toggleUserSelection(user);
    } else {
      setSelectedUser(user);
    }
  };

  const renderUserList = (userList: User[]) => {
    if (!userList || userList.length === 0) {
      return (
        <div className="px-4 py-8 text-center text-muted-foreground">
          No users found
        </div>
      );
    }

    return userList.map((user) => (
      <div
        key={user.id}
        className="px-4 flex gap-x-3 items-center p-2 rounded-md cursor-pointer hover:bg-primary-600/10"
        onClick={() => handleUserClick(user)}
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
          checked={
            view === "newGroup"
              ? selectedUsers.some((u) => u.id === user.id)
              : selectedUser?.id === user.id
          }
          onCheckedChange={(checked) => {
            if (view === "newGroup") {
              toggleUserSelection(user);
            } else {
              setSelectedUser(checked ? user : undefined);
            }
          }}
        />
      </div>
    ));
  };

  // Clear search when switching views
  useEffect(() => {
    setSearchQuery("");
  }, [view]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant={"ghost"} className="text-primary-600">
          <Edit className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="px-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="relative border-b pb-2 flex-shrink-0">
          {view === "newGroup" && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute left-4 top-1/2 -translate-y-1/2"
              onClick={() => setView("newMessage")}
            >
              <ArrowLeft className="size-5" />
            </Button>
          )}
          <DialogTitle className="text-center">
            {view === "newMessage" ? "New Message" : "New Group"}
          </DialogTitle>
        </DialogHeader>

        {view === "newMessage" ? (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center gap-x-4 px-4 border-y border-neutral-400 py-2 flex-shrink-0">
              <span className="b2-medium">To:</span>
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none px-0"
              />
            </div>
            <div
              className="flex items-center gap-x-2 py-2 px-4 b3-medium cursor-pointer hover:bg-primary-600/10 flex-shrink-0"
              onClick={() => setView("newGroup")}
            >
              <UsersRound className="size-10 p-2 rounded-full text-primary-600 bg-primary-100" />
              New Group
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="space-y-2">
                {isLoading && <UserSkeletonList />}
                {!isLoading && searchQuery && users && renderUserList(users)}
                {!isLoading && !searchQuery && suggestedUsers && (
                  <>
                    <p className="px-4 text-muted-foreground b2-medium">
                      Suggested
                    </p>
                    {renderUserList(suggestedUsers)}
                  </>
                )}
              </div>
            </div>
            <div className="px-4 border-t pt-4 flex-shrink-0">
              <Button
                className="w-full"
                onClick={handleStartOneOnOneChat}
                disabled={!selectedUser || isCreatingChat}
              >
                {isCreatingChat ? "Creating..." : "Start Chat"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="px-4 space-y-4 flex-shrink-0">
              <PhotoUpload onFileSelect={setGroupAvatar} size="sm" />
              <Input
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <Input
                placeholder="Search users to add..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {selectedUsers.length > 0 && (
              <div className="px-4 py-2 flex-shrink-0">
                <p className="text-sm text-muted-foreground mb-2">
                  Selected ({selectedUsers.length})
                </p>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-1 bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs"
                    >
                      <span>
                        {user.firstName} {user.lastName}
                      </span>
                      <button
                        onClick={() => toggleUserSelection(user)}
                        className="ml-1 hover:bg-primary-200 rounded-full w-4 h-4 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="space-y-2">
                {searchQuery ? (
                  <>
                    {isLoading && <UserSkeletonList />}
                    {!isLoading && users && renderUserList(users)}
                  </>
                ) : (
                  <>
                    <p className="px-4 text-muted-foreground b2-medium">
                      Suggested
                    </p>
                    {isLoadingSuggested && <UserSkeletonList />}
                    {!isLoadingSuggested &&
                      suggestedUsers &&
                      renderUserList(suggestedUsers)}
                  </>
                )}
              </div>
            </div>
            <div className="px-4 border-t pt-4 flex-shrink-0">
              <Button
                className="w-full"
                onClick={handleCreateGroup}
                disabled={
                  isCreatingGroup ||
                  !groupName.trim() ||
                  selectedUsers.length === 0
                }
              >
                {isCreatingGroup
                  ? "Creating..."
                  : `Create Group (${selectedUsers.length} member${
                      selectedUsers.length !== 1 ? "s" : ""
                    })`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const UserSkeleton = () => (
  <div className="px-4 flex items-center gap-x-2 p-2 rounded-md">
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
