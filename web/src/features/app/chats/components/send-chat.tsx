import { ReactNode } from "react";
import { useCreateOneToOneChatMutation } from "../api";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import ApiError from "@/features/api-error";

export const SendChat: React.FC<{
  userId: string;
  children: ReactNode;
  className?: string;
}> = ({ userId, children, className }) => {
  const [createChat] = useCreateOneToOneChatMutation();
  const navigate = useNavigate();

  const handleSendChat = async () => {
    try {
      const chat = await createChat(userId).unwrap();
      navigate(`/chats/${chat.id}`);
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Something went wrong";
      toast.error(message);
    }
  };

  return (
    <div className={className} onClick={handleSendChat}>
      {children}
    </div>
  );
};
