import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Chat } from "../types";
import { useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatHeaderProps {
  chat: Chat;
  onInfoClick: () => void;
}

export const ChatHeader = ({ chat, onInfoClick }: ChatHeaderProps) => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const onlineUsers = useAppSelector((state) => state.chats.onlineUsers);

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

  const getName = () => {
    if (chat.type === "GROUP") {
      return chat.name;
    }
    if (chatPartner) {
      return `${chatPartner.firstName} ${chatPartner.lastName}`;
    }
    return "";
  };

  const getAvatar = () => {
    if (chat.chatImage) {
      return chat.chatImage;
    }

    if (chat.type === "GROUP") {
      return "/assets/images/society-placeholder.png";
    }
    if (chatPartner) {
      return chatPartner.avatar;
    }
    return "";
  };

  const getFallback = () => {
    if (chat.type === "GROUP" && chat.name) {
      return chat.name.substring(0, 2).toUpperCase();
    }
    if (chatPartner) {
      return `${chatPartner.firstName?.[0]}${chatPartner.lastName?.[0]}`;
    }
    return "";
  };

  const getGroupMembersText = () => {
    const memberNames = chat.participants
      .map((p) => {
        const user = p.student || p.advisor;
        if (user?.id === currentUser?.id) {
          return "You";
        }
        return user?.firstName;
      })
      .filter(Boolean) as string[];

    if (memberNames.length > 3) {
      return `${memberNames.slice(0, 3).join(", ")} and ${
        memberNames.length - 3
      } more`;
    }
    return memberNames.join(", ");
  };

  return (
    <div className="flex items-center p-6 gap-4 border-b">
      <Avatar className="size-10">
        <AvatarImage src={getAvatar()} alt={getName()} />
        <AvatarFallback>{getFallback()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <h3 className="b2-semibold">{getName()}</h3>
        <div className="b4-medium flex items-center gap-1 text-neutral-500">
          {chat.type === "ONE_ON_ONE" ? (
            <>
              <span
                className={`size-2 rounded-full ${
                  isOnline ? "bg-green-500" : "bg-neutral-500"
                }`}
              />
              {isOnline ? "Online" : "Offline"}
            </>
          ) : (
            <p className="line-clamp-1">{getGroupMembersText()}</p>
          )}
        </div>
      </div>
      <Button
        variant={"ghost"}
        size={"icon"}
        className="text-primary-600 bg-neutral-100 rounded-full"
        onClick={onInfoClick}
      >
        <Info />
      </Button>
    </div>
  );
};

ChatHeader.Skeleton = function () {
  return (
    <div className="flex items-center p-6 gap-4 border-b">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex-1 space-y-0.5">
        <Skeleton className="w-[120px] h-[22px]" />
        <Skeleton className="w-[60px] h-[16px]" />
      </div>
      <Skeleton className="size-8 rounded-full" />
    </div>
  );
};
