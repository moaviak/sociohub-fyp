import { useAppSelector } from "@/app/hooks";
import { ChatItem } from "./components/chat-item";
import { NewChatDialog } from "./components/new-chat-dialog";
import { useGetChatsQuery } from "./api";
import { Link } from "react-router";
import { SearchInput } from "@/components/search-input";
import { Skeleton } from "@/components/ui/skeleton";

export const ChatList: React.FC<{ chatId?: string }> = ({ chatId }) => {
  const { chats } = useAppSelector((state) => state.chats);
  const { isLoading } = useGetChatsQuery();
  const totalUnreadCount = chats.reduce(
    (acc, chat) => acc + chat.unreadCount,
    0
  );

  if (isLoading) {
    return (
      <div className="flex flex-col max-h-full h-full overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <Skeleton className="w-[130px] h-[28px]" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
        <div className="px-6 py-3">
          <Skeleton className="w-[206px] h-[36px]" />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">
          <ChatItem.Skeleton />
          <ChatItem.Skeleton />
          <ChatItem.Skeleton />
          <ChatItem.Skeleton />
          <ChatItem.Skeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-full h-full overflow-hidden">
      <div className="p-6 border-b flex justify-between items-center">
        <div className="flex items-center gap-x-4">
          <h2 className="h6-semibold">Messages</h2>
          <span className="rounded-full size-5 flex justify-center items-center b4-regular bg-neutral-200 text-neutral-600">
            {totalUnreadCount}
          </span>
        </div>
        <NewChatDialog />
      </div>
      <div className="px-6 py-3">
        <SearchInput
          className="w-full outline-0 bg-neutral-100"
          placeholder="Search messages"
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">
        {chats.map((chat) => (
          <Link key={chat.id} to={`/chats/${chat.id}`}>
            <ChatItem chat={chat} isSelected={chatId === chat.id} />
          </Link>
        ))}
      </div>
    </div>
  );
};
