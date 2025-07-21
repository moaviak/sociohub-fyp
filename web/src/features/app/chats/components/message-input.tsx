import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Send } from "lucide-react";
import { useSendMessageMutation } from "../api";
import { useAppDispatch } from "@/app/hooks";
import { addMessage, updateMessage } from "../slice";
import { Message, Participant } from "../types";
import { v4 as uuid } from "uuid";
import { getSocket } from "@/lib/socket";
import { ChatAttachments } from "./chat-attachments";

interface MessageInputProps {
  chatId: string;
  currentSender: Participant;
}

export const MessageInput = ({ chatId, currentSender }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [sendMessageMutation] = useSendMessageMutation();
  const dispatch = useAppDispatch();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [message]);

  const handleStopTyping = () => {
    getSocket()?.emit("stop-typing", { chatId });
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      const messageId = uuid();
      const newMessage: Message = {
        id: messageId,
        attachments: [],
        chatId,
        content: message,
        sender: currentSender,
        createdAt: new Date().toISOString(),
        readBy: [],
        senderId: currentSender.id,
        updatedAt: new Date().toISOString(),
        isSending: true,
        isError: false,
      };
      dispatch(
        addMessage({ message: newMessage, currentUserId: currentSender.id })
      );
      setMessage("");
      handleStopTyping();

      try {
        await sendMessageMutation({
          chatId,
          content: message,
        }).unwrap();
      } catch (error) {
        console.error("Failed to send message:", error);
        dispatch(
          updateMessage({
            id: messageId,
            chatId,
            updates: { isError: true },
          })
        );
      } finally {
        dispatch(
          updateMessage({
            id: messageId,
            chatId,
            updates: { isSending: false },
          })
        );
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    getSocket()?.emit("typing", { chatId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(handleStopTyping, 3000); // 3 seconds
  };

  const showSendButton = message.trim().length > 0;

  return (
    <div className="p-4 border-t bg-white">
      <div className="flex w-full gap-2 rounded-2xl border border-neutral-300 py-1 px-3">
        <ChatAttachments currentSender={currentSender} />

        <textarea
          ref={textareaRef}
          placeholder="Type a message..."
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent border-0 b2-regular outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none resize-none overflow-y-auto min-h-6 max-h-32 placeholder:text-neutral-500 self-center"
          rows={1}
        />

        <div className="shrink-0 self-end">
          {showSendButton ? (
            <Button
              onClick={handleSendMessage}
              size="icon"
              variant={"ghost"}
              className="text-primary-600"
            >
              <Send className="size-5" />
            </Button>
          ) : (
            <Button
              variant={"ghost"}
              size={"icon"}
              className="shrink-0 text-primary-600 hover:bg-neutral-100"
            >
              <Mic className="size-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
