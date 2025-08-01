import { useChatScroll } from "@/hooks/useChatScroll";
import { Message, IUser } from "../types";
import { MessagesGroup, MessagesGroupSkeleton } from "./messages-group";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppSelector } from "@/app/hooks";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  chatId: string;
}

export interface MessagesGroup {
  sender: IUser;
  messages: Message[];
}

export const MessageList = ({ messages, chatId }: MessageListProps) => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const typingUsers = useAppSelector(
    (state) => state.chats.typingUsers[chatId]
  );
  const activeChat = useAppSelector((state) => state.chats.activeChat);
  const ref = useChatScroll(messages) as React.RefObject<HTMLDivElement>;

  const messageGroups = groupMessages(messages);
  const isTyping = typingUsers && typingUsers.length > 0;

  const getTypingParticipant = (userId: string) => {
    return activeChat?.participants.find(
      (p) => p.studentId === userId || p.advisorId === userId
    );
  };

  return (
    <div
      ref={ref}
      className="flex-1 p-6 min-h-0 flex flex-col gap-y-4 overflow-y-auto custom-scrollbar"
    >
      {messageGroups.map((messageGroup, idx) => (
        <MessagesGroup
          key={idx}
          messages={messageGroup.messages}
          sender={messageGroup.sender}
        />
      ))}
      {isTyping &&
        typingUsers
          .filter((userId) => userId !== currentUser?.id)
          .map((userId) => {
            const typingParticipant = getTypingParticipant(userId);
            const typingUser =
              typingParticipant?.advisor || typingParticipant?.student;
            return (
              <div key={userId} className={cn("w-full flex gap-x-2")}>
                <Avatar className="size-9">
                  <AvatarImage src={typingUser?.avatar} />
                  <AvatarFallback>
                    {typingUser?.firstName?.[0]}
                    {typingUser?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className={"space-y-0.5"}>
                  <div
                    className={cn(
                      "px-4 py-2 b3-regular rounded-lg relative",
                      "bg-neutral-200",
                      "rounded-tl-none"
                    )}
                  >
                    <TypingIndicator />
                  </div>
                </div>
              </div>
            );
          })}
    </div>
  );
};

const groupMessages = (messages: Message[]): MessagesGroup[] => {
  const groups: MessagesGroup[] = [];

  for (const message of messages) {
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup.sender.id === message.sender.id) {
      lastGroup.messages.push(message);
    } else {
      groups.push({
        sender: message.sender,
        messages: [message],
      });
    }
  }

  return groups;
};

MessageList.Skeleton = function () {
  return (
    <div className="flex-1 p-6 min-h-0 space-y-6 overflow-y-auto custom-scrollbar">
      <MessagesGroupSkeleton />
      <MessagesGroupSkeleton className="flex-row-reverse" />
      <MessagesGroupSkeleton />
    </div>
  );
};

export const TypingIndicator = () => {
  return (
    <div className="flex space-x-1 py-1">
      <div
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      ></div>
      <div
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      ></div>
      <div
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      ></div>
    </div>
  );
};
