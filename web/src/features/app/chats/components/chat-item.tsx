import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Chat } from "../types";
import { useAppSelector } from "@/app/hooks";
import { cn, formatTimeShort } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { File, Image, Video } from "lucide-react";

interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
}

export const ChatItem = ({ chat, isSelected }: ChatItemProps) => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const typingUsers = useAppSelector(
    (state) => state.chats.typingUsers[chat.id]
  );
  const lastMessage = chat.messages?.[0];

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

  const isTyping = typingUsers && typingUsers.length > 0;

  const getName = () => {
    if (chat.type === "GROUP") {
      return chat.name;
    }
    if (chatPartner) {
      return `${chatPartner.firstName} ${chatPartner.lastName}`;
    }
    return "One-on-One Chat";
  };

  const getAvatar = () => {
    if (chat.chatImage) {
      return chat.chatImage;
    }

    if (chat.type === "GROUP") {
      return `/assets/images/society-placeholder.png`;
    }

    if (chatPartner) {
      return chatPartner.avatar;
    }
    return "https://github.com/shadcn.png";
  };

  const getFallback = () => {
    if (chat.type === "GROUP" && chat.name) {
      return chat.name.substring(0, 2).toUpperCase();
    }
    if (chatPartner) {
      return `${chatPartner.firstName?.[0]}${chatPartner.lastName?.[0]}`;
    }
    return "??";
  };

  const getTypingText = () => {
    if (!isTyping) {
      if (lastMessage?.attachments && !lastMessage.content) {
        const attachment =
          lastMessage.attachments[lastMessage.attachments.length - 1];
        if (attachment.type === "IMAGE" || attachment.type === "VIDEO") {
          return attachment.type === "IMAGE" ? (
            <div className="flex items-center gap-x-1">
              <Image className="size-3.5" />
              Image
            </div>
          ) : (
            <div className="flex items-center gap-x-1">
              <Video className="size-3.5" />
              Video
            </div>
          );
        }

        if (attachment.type === "DOCUMENT") {
          return (
            <div className="flex items-center gap-x-1">
              <File className="size-3.5 shrink-0" />
              <p className="line-clamp-1">{attachment.name}</p>
            </div>
          );
        }
      }
      return lastMessage?.content;
    }

    if (chat.type === "GROUP") {
      const typingUserId = typingUsers[0];
      const typingParticipant = chat.participants.find(
        (p) => (p.student?.id || p.advisor?.id) === typingUserId
      );
      const user = typingParticipant?.student || typingParticipant?.advisor;
      if (user) {
        return (
          <span className="text-primary-500 b3-medium">
            {user.firstName} is typing...
          </span>
        );
      }
    }

    // Fallback for ONE_ON_ONE or if user not found in group
    return <span className="text-primary-500 b3-medium">typing...</span>;
  };

  return (
    <div
      className={cn(
        "flex items-center p-3 gap-4 cursor-pointer transition-colors hover:bg-primary-600/10",
        isSelected && "bg-primary-600/10"
      )}
    >
      <Avatar className="size-12">
        <AvatarImage src={getAvatar()} alt={getName()} />
        <AvatarFallback>{getFallback()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 gap-y-2">
        <div className="flex justify-between">
          <h3 className="b3-medium line-clamp-1">{getName()}</h3>
          <p className="b4-medium text-neutral-400">
            {lastMessage && formatTimeShort(lastMessage.createdAt)}
          </p>
        </div>
        <div className="flex justify-between items-center">
          <div className="b3-regular text-neutral-600">{getTypingText()}</div>
          {chat.unreadCount > 0 && (
            <div className="bg-primary-500 text-white text-xs rounded-full size-5 flex items-center justify-center">
              {chat.unreadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ChatItem.Skeleton = function () {
  return (
    <div className={cn("flex items-center p-3 gap-4")}>
      <Skeleton className="size-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="w-[88px] h-[20px]" />
          <Skeleton className="w-[25px] h-[20px]" />
        </div>
        <Skeleton className="w-[167px] h-[20px]" />
      </div>
    </div>
  );
};
