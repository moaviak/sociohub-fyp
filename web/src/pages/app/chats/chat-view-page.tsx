import { ChatView } from "@/features/app/chats/chat-view";
import { useGetChatsQuery } from "@/features/app/chats/api";
import { setActiveChat } from "@/features/app/chats/slice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";

const ChatViewPage = () => {
  const dispatch = useDispatch();
  const { chatId } = useParams();
  const { isSuccess, isFetching } = useGetChatsQuery();

  useEffect(() => {
    if (isSuccess && !isFetching) {
      dispatch(setActiveChat(chatId));
    }
  }, [chatId, dispatch, isSuccess, isFetching]);

  return (
    <div className="h-full min-h-0">
      <ChatView />
    </div>
  );
};
export default ChatViewPage;
