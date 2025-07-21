import { ChatList } from "@/features/app/chats/chat-list";
import { MessageCircleMore } from "lucide-react";
import { Outlet, useParams } from "react-router";

const ChatsPage = () => {
  const { chatId } = useParams();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-full max-h-full overflow-hidden">
      <div className="md:col-span-1 lg:col-span-1 border-r overflow-hidden h-full max-h-full">
        <ChatList chatId={chatId} />
      </div>
      <div className="md:col-span-2 lg:col-span-3 h-full min-h-0 max-h-full">
        {chatId ? (
          <Outlet />
        ) : (
          <div className="h-full flex flex-col gap-y-4 text-center items-center justify-center p-4">
            <MessageCircleMore className="size-14 text-primary-600" />
            <div>
              <h6 className="h6-semibold text-primary-600">Your messages</h6>
              <p className="b3-regular text-neutral-700">
                Send a message to start a chat.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ChatsPage;
