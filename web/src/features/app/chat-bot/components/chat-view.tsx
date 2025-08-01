import { Button } from "@/components/ui/button";
import { Bot, X } from "lucide-react";
import { Message } from "./message";
import { MessageInput } from "./message-input";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { v4 as uuid } from "uuid";
import {
  addMessage,
  clearAgentThought,
  clearToolStatus,
  setSessionId,
} from "../slice";
import { useCreateSessionMutation, useSendQueryMutation } from "../api";
import { TypingIndicator } from "../../chats/components/message-list";
import { useChatScroll } from "@/hooks/useChatScroll";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import ApiError from "@/features/api-error";
import { useState } from "react";
import { SpinnerLoader } from "@/components/spinner-loader";
import { AgentThoughtIndicator } from "./agent-thought-indicator";
import { ToolStatusIndicator } from "./tool-status-indicator";

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

export const ChatView: React.FC<{
  setIsPopoverOpen: (value: React.SetStateAction<boolean>) => void;
}> = ({ setIsPopoverOpen }) => {
  const { messages, sessionId, isLoading, toolStatus, agentThought } =
    useAppSelector((state) => state.chatBot);
  const dispatch = useAppDispatch();

  const [sendQuery, { isLoading: isBotReplying }] = useSendQueryMutation();
  const [createSession, { isLoading: isSessionRefreshing }] =
    useCreateSessionMutation();

  const ref = useChatScroll(messages) as React.RefObject<HTMLDivElement>;
  const [sessionError, setSessionError] = useState<string | null>(null);

  const handleSessionRefresh = async () => {
    try {
      setSessionError(null);
      await createSession().unwrap();
    } catch (error) {
      console.error("Failed to refresh session:", error);
      setSessionError("Failed to create a new chat session. Please try again.");
    }
  };

  // Handle session refresh if there's no session
  if (!sessionId && !isLoading) {
    handleSessionRefresh();
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {sessionError || "Initializing chat session..."}
          </AlertDescription>
        </Alert>
        {sessionError && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSessionRefresh}
            disabled={isSessionRefreshing}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <SpinnerLoader size="sm" />
      </div>
    );
  }

  const handleSendMessage = async (messageText: string) => {
    if (!sessionId) return;

    const newMessage: ChatMessage = {
      id: uuid(),
      text: messageText,
      isUser: true,
      timestamp: new Date().toISOString(),
    };
    dispatch(addMessage(newMessage));

    try {
      const response = await sendQuery({
        sessionId,
        query: messageText,
      }).unwrap();
      dispatch(addMessage(response));
      setSessionError(null);
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Failed to send message:", error);

      if (
        (apiError.errorMessage && apiError.errorMessage.includes("Session")) ||
        apiError.errorMessage.includes("session")
      ) {
        dispatch(setSessionId(null));
        setSessionError("Chat session expired. Creating a new session...");
        handleSessionRefresh();
      } else {
        dispatch(
          addMessage({
            id: uuid(),
            text: "Sorry, I encountered an error. Please try again.",
            isUser: false,
            timestamp: new Date().toISOString(),
          })
        );
      }
    } finally {
      dispatch(clearToolStatus());
      dispatch(clearAgentThought());
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-blue-500" />
          <h3 className="font-semibold">SocioBot</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsPopoverOpen(false)}
          className="h-6 w-6 p-0"
        >
          <X size={14} />
        </Button>
      </div>

      {/* Messages */}
      <div
        ref={ref}
        className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar"
      >
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}

        {/* Agent Thought Process Display */}
        {agentThought && <AgentThoughtIndicator agentThought={agentThought} />}

        {/* Tool Status Display */}
        {toolStatus && toolStatus.length > 0 && (
          <ToolStatusIndicator toolStatus={toolStatus} />
        )}

        {/* Bot Reply Indicator */}
        {isBotReplying && (
          <div className={`flex justify-start`}>
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm bg-neutral-200 text-neutral-900`}
            >
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <MessageInput
          handleSendMessage={handleSendMessage}
          disabled={isBotReplying}
        />
      </div>
    </div>
  );
};
