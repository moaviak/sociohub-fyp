import React from "react";
import { MessagesGroup as MessagesGroupProps } from "./message-list";
import { useAppSelector } from "@/app/hooks";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageBubble } from "./message-bubble";
import { Skeleton } from "@/components/ui/skeleton";

export const MessagesGroup: React.FC<MessagesGroupProps> = ({
  sender,
  messages,
}) => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const senderUser = sender.advisor || sender.student;
  const isSender = senderUser?.id === currentUser?.id;

  return (
    <div
      className={cn(
        "w-full flex gap-x-2",
        senderUser?.id === currentUser?.id && "flex-row-reverse"
      )}
    >
      <Avatar className="size-9">
        <AvatarImage src={senderUser?.avatar} />
        <AvatarFallback>
          {senderUser?.firstName?.[0]}
          {senderUser?.lastName?.[0]}
        </AvatarFallback>
      </Avatar>
      <div className={"w-full space-y-0.5"}>
        {messages.map((message, idx) => (
          <MessageBubble
            key={message.id}
            message={message}
            isSender={isSender}
            isFirstInGroup={idx === 0}
          />
        ))}
      </div>
    </div>
  );
};

export const MessagesGroupSkeleton = function ({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("flex gap-x-2", className)}>
      <Skeleton className="size-9 rounded-full" />
      <div className={"space-y-0.5"}>
        <Skeleton className={cn("h-[36px] w-[220px]", className)} />
        <Skeleton className={cn("h-[36px] w-[220px]", className)} />
        <Skeleton className={cn("h-[36px] w-[220px]", className)} />
      </div>
    </div>
  );
};
