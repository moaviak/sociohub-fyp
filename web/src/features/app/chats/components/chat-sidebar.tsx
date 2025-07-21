import { cn } from "@/lib/utils";
import { Chat } from "../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, UserPlus } from "lucide-react";
import {
  useRemoveParticipantMutation,
  useDeleteOneToOneChatMutation,
  useLeaveGroupChatMutation,
  useDeleteGroupChatMutation,
} from "../api";
import { toast } from "sonner";
import { AddMembersDialog } from "./add-members-dialog";
import { PhotoUpload } from "@/components/photo-upload";
import { useNavigate } from "react-router";

interface ChatSidebarProps {
  isSidebarOpen: boolean;
  chat: Chat;
}

export const ChatSidebar = ({ isSidebarOpen, chat }: ChatSidebarProps) => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const onlineUsers = useAppSelector((state) => state.chats.onlineUsers);
  const [removeParticipant] = useRemoveParticipantMutation();
  const [deleteOneToOneChat, { isLoading: isDeletingChat }] =
    useDeleteOneToOneChatMutation();
  const [leaveGroupChat, { isLoading: isLeaving }] =
    useLeaveGroupChatMutation();
  const [deleteGroupChat, { isLoading: isDeletingGroup }] =
    useDeleteGroupChatMutation();
  const navigate = useNavigate();

  const getChatPartner = () => {
    if (chat.type === "ONE_ON_ONE") {
      const partner = chat.participants.find(
        (p) =>
          p.studentId !== currentUser?.id && p.advisorId !== currentUser?.id
      );
      return { ...partner, ...partner?.student, ...partner?.advisor };
    }
    return null;
  };

  const chatPartner = getChatPartner();
  const isOnline = chatPartner && onlineUsers[chatPartner.id!];
  const isAdmin =
    chat.type === "GROUP" &&
    (chat.admin?.advisorId === currentUser?.id ||
      chat.admin?.studentId === currentUser?.id);

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      await removeParticipant({ chatId: chat.id, participantId }).unwrap();
      toast.success("Member removed successfully!");
    } catch (error) {
      toast.error("Failed to remove member.");
      console.error(error);
    }
  };

  const handleDeleteOneToOneChat = async () => {
    try {
      await deleteOneToOneChat(chat.id).unwrap();
      toast.success("Chat deleted successfully!");
      navigate("/chats"); // Navigate away from the deleted chat
    } catch (error) {
      toast.error("Failed to delete chat.");
      console.error(error);
    }
  };

  const handleLeaveGroupChat = async () => {
    try {
      await leaveGroupChat(chat.id).unwrap();
      toast.success("Left group successfully!");
      navigate("/chats"); // Navigate away from the left group
    } catch (error) {
      toast.error("Failed to leave group.");
      console.error(error);
    }
  };

  const handleDeleteGroupChat = async () => {
    try {
      await deleteGroupChat(chat.id).unwrap();
      toast.success("Group deleted successfully!");
      navigate("/chats"); // Navigate away from the deleted group
    } catch (error) {
      toast.error("Failed to delete group.");
      console.error(error);
    }
  };

  return (
    <div
      className={cn(
        "h-full bg-white shadow-lg transition-all duration-300 ease-in-out border-l flex flex-col",
        isSidebarOpen ? "w-1/3" : "w-0 overflow-hidden"
      )}
    >
      <h3 className="h6-semibold p-6 border-b">Details</h3>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {chat.type === "ONE_ON_ONE" && chatPartner && (
          <div className="mt-4 flex flex-col items-center">
            <Avatar className="size-24">
              <AvatarImage
                src={chatPartner.avatar}
                alt={`${chatPartner.firstName} ${chatPartner.lastName}`}
              />
              <AvatarFallback>{`${chatPartner.firstName?.[0]}${chatPartner.lastName?.[0]}`}</AvatarFallback>
            </Avatar>
            <p className="text-lg font-semibold mt-2">{`${chatPartner.firstName} ${chatPartner.lastName}`}</p>
            <div className="b4-medium flex items-center gap-1 text-neutral-500">
              <span
                className={`size-2 rounded-full ${
                  isOnline ? "bg-green-500" : "bg-neutral-500"
                }`}
              />
              {isOnline ? "Online" : "Offline"}
            </div>
            <Button variant={"outline"} className="my-4" asChild>
              <Link
                to={`/profile/${
                  chatPartner.advisorId || chatPartner.studentId
                }`}
              >
                View Profile
              </Link>
            </Button>
          </div>
        )}

        {chat.type === "GROUP" && (
          <div className="">
            <div className="m-4 flex flex-col items-center text-center">
              {isAdmin ? (
                <PhotoUpload
                  size="sm"
                  initialImage={
                    chat.chatImage || "/assets/images/society-placeholder.png"
                  }
                />
              ) : (
                <Avatar className="size-16">
                  <AvatarImage
                    src={
                      chat.chatImage || "/assets/images/society-placeholder.png"
                    }
                    alt={chat.name}
                  />
                  <AvatarFallback>{`${
                    chat.name ? chat.name.substring(0, 2).toUpperCase() : ""
                  }`}</AvatarFallback>
                </Avatar>
              )}
              <p className="text-lg font-semibold mt-2">{`${chat.name}`}</p>
            </div>
            {isAdmin && (
              <AddMembersDialog chat={chat}>
                <div className="flex items-center gap-x-2 py-2 px-4 b3-medium cursor-pointer hover:bg-primary-600/10 flex-shrink-0">
                  <UserPlus className="size-10 p-2 rounded-full text-primary-600 bg-primary-100" />
                  Add members
                </div>
              </AddMembersDialog>
            )}
            <div className="mt-2 flex flex-col gap-y-2 px-4">
              <p className="b2-semibold">
                Members ({chat.participants.length})
              </p>
              <ul className="overflow-y-auto custom-scrollbar max-h-60">
                {chat.participants.map((p) => {
                  const user = p.student || p.advisor;
                  const isParticipantAdmin = p.id === chat.adminId;
                  return (
                    <li
                      key={user?.id}
                      className="flex items-center justify-between gap-2 mt-2"
                    >
                      <Link
                        to={`/profile/${user?.id}`}
                        className="flex items-center gap-2"
                      >
                        <Avatar className="size-8">
                          <AvatarImage
                            src={user?.avatar}
                            alt={`${user?.firstName} ${user?.lastName}`}
                          />
                          <AvatarFallback>{`${user?.firstName?.[0]}${user?.lastName?.[0]}`}</AvatarFallback>
                        </Avatar>
                        <span>
                          {user?.firstName} {user?.lastName}{" "}
                          {user?.id === currentUser?.id && "(You)"}
                        </span>
                        {isParticipantAdmin && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                            Admin
                          </span>
                        )}
                      </Link>
                      {isAdmin && user?.id !== currentUser?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Button
                                variant={"ghost"}
                                size={"inline"}
                                className="text-red-500"
                                onClick={() =>
                                  handleRemoveParticipant(user!.id)
                                }
                              >
                                Remove Member
                              </Button>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t flex flex-col gap-2">
        {chat.type === "ONE_ON_ONE" && (
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDeleteOneToOneChat}
            disabled={isDeletingChat}
          >
            Delete Chat
          </Button>
        )}
        {chat.type === "GROUP" && !isAdmin && (
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLeaveGroupChat}
            disabled={isLeaving}
          >
            Leave Group
          </Button>
        )}
        {chat.type === "GROUP" && isAdmin && (
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDeleteGroupChat}
            disabled={isDeletingGroup}
          >
            Delete Group
          </Button>
        )}
      </div>
    </div>
  );
};
