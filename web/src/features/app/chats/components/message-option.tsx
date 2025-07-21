import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Message } from "../types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { useDeleteMessageMutation } from "../api";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { deleteMessage as deleteMessageFromState } from "../slice";

export const MessageOptions: React.FC<{ message: Message }> = ({ message }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteMessage] = useDeleteMessageMutation();
  const currentUser = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const handleDelete = async () => {
    dispatch(
      deleteMessageFromState({ messageId: message.id, chatId: message.chatId })
    );
    try {
      await deleteMessage(message.id).unwrap();
    } catch (error) {
      console.error(error);
    }
  };

  const isSender =
    message.sender.student?.id === currentUser?.id ||
    message.sender.advisor?.id === currentUser?.id;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={"ghost"}
          size={"icon"}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="b4-regular">
          {format(message.createdAt, "dd/MM/yyyy, hh:mm aa")}
        </DropdownMenuLabel>
        {isSender && (
          <DropdownMenuItem className="text-red-500" onClick={handleDelete}>
            Delete Message
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
