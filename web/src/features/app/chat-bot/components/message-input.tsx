import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useRef, useState, useEffect } from "react";

export const MessageInput: React.FC<{
  handleSendMessage: (message: string) => Promise<void>;
  disabled?: boolean;
}> = ({ handleSendMessage, disabled }) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea function
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";

      // Calculate the new height
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 128; // 8rem (max-h-32) converted to pixels
      const minHeight = 24; // Smaller minimum height for single line

      // Set the height to scrollHeight, but not exceeding maxHeight
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;

      // Show/hide scrollbar based on content
      if (scrollHeight > maxHeight) {
        textarea.style.overflowY = "auto";
      } else {
        textarea.style.overflowY = "hidden";
      }
    }
  };

  // Adjust height whenever message changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // Also adjust on component mount
  useEffect(() => {
    adjustTextareaHeight();
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      handleSendMessage(message.trim());
      setMessage("");
      // Reset textarea height after clearing
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        setTimeout(() => adjustTextareaHeight(), 0);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (disabled) {
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  return (
    <div className="flex w-full gap-2 rounded-lg border border-neutral-300 px-2 py-2">
      <textarea
        ref={textareaRef}
        placeholder="Ask Assistant"
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent border-0 b3-regular outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none resize-none placeholder:text-neutral-500 leading-5"
        style={{
          minHeight: "40px",
          maxHeight: "128px",
          overflowY: "hidden",
          lineHeight: "1.25rem",
        }}
        rows={1}
      />
      <Button
        size="icon"
        variant={"ghost"}
        className="text-primary-600 self-end mb-1"
        onClick={() => sendMessage()}
        disabled={!message.trim() || disabled}
      >
        <Send className="size-5" />
      </Button>
    </div>
  );
};
