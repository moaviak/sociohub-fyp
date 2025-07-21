import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { ChatHeader } from "./components/chat-header";
import { MessageList } from "./components/message-list";
import { MessageInput } from "./components/message-input";
import { chatsApi, useGetMessagesByChatIdQuery } from "./api";
import { useEffect, useState } from "react";
import { markChatAsRead } from "./slice";
import { cn } from "@/lib/utils";
import { ChatSidebar } from "./components/chat-sidebar";

export const ChatView = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const { activeChat } = useAppSelector((state) => state.chats);
  const dispatch = useAppDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const { isFetching: isLoading } = useGetMessagesByChatIdQuery(
    activeChat?.id || "",
    {
      skip: !activeChat,
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    if (activeChat?.id) {
      dispatch(markChatAsRead(activeChat.id));
      dispatch(chatsApi.endpoints.markChatAsRead.initiate(activeChat.id));
    }
  }, [activeChat?.id, dispatch]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-between h-full min-h-0 overflow-hidden">
        <ChatHeader.Skeleton />
        <MessageList.Skeleton />
      </div>
    );
  }

  if (!activeChat) {
    return null;
  }

  const currentSender = activeChat.participants.find(
    (participant) =>
      participant.advisor?.id === currentUser?.id ||
      participant.student?.id === currentUser?.id
  );

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      <div
        className={cn(
          "flex flex-col justify-between h-full min-h-0 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-2/3" : "w-full"
        )}
      >
        <ChatHeader chat={activeChat} onInfoClick={toggleSidebar} />
        <MessageList
          messages={activeChat.messages || []}
          isLoading={isLoading}
          chatId={activeChat.id}
        />
        <MessageInput chatId={activeChat.id} currentSender={currentSender!} />
      </div>

      <ChatSidebar isSidebarOpen={isSidebarOpen} chat={activeChat} />
    </div>
  );
};
