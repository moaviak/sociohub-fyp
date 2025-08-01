import { ChatMessage } from "./chat-view";
import ReactMarkdown from "react-markdown";

export const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
  return (
    <div
      key={message.id}
      className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
          message.isUser
            ? "bg-primary-500 text-white"
            : "bg-neutral-200 text-neutral-900"
        }`}
      >
        <ReactMarkdown>{message.text}</ReactMarkdown>
      </div>
    </div>
  );
};
