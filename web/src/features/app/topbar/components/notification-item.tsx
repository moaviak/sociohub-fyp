import { useNavigate } from "react-router";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Notification } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDeleteNotificationMutation } from "../api";
import { toast } from "sonner";
import React, { useEffect, useState } from "react";
import ApiError from "@/features/api-error";
import { markNotificationRead } from "@/features/app/notifications/socket-provider";
import { Hint } from "@/components/hint";

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
}

export const NotificationItem = ({
  notification,
  onClick,
}: NotificationItemProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const [deleteNotificaton, { isLoading, isError, error }] =
    useDeleteNotificationMutation();

  useEffect(() => {
    if (isError) {
      toast.error(
        (error as ApiError).errorMessage || "Unexpected error occurred."
      );
    }
  }, [error, isError]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick();
    if (notification.redirectUrl) navigate(notification.redirectUrl);
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const response = await deleteNotificaton({
      notificationId: notification.id,
    });

    if (response && !("error" in response)) {
      markNotificationRead(notification.id);
      toast.success("Notification deleted.");
      setIsOpen(false);
    }
  };

  return (
    <div onClick={handleClick}>
      <div
        className={cn(
          "py-3 px-6 cursor-pointer hover:bg-gray-100 transition-colors duration-200 flex items-center gap-x-4",
          notification.isRead ? "bg-white" : "bg-primary-600/25"
        )}
      >
        {notification.image && (
          <img
            src={notification.image}
            alt={notification.title}
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
        <div className="flex-1 max-h-20 overflow-hidden flex flex-col justify-between">
          <p className="b3-medium text-gray-900">{notification.title}</p>
          {notification.description && (
            <Hint
              description={notification.description}
              side="bottom"
              sideOffset={5}
            >
              <p className="b4-regular text-neutral-600 mt-1 overflow-ellipsis line-clamp-2 flex-1">
                {notification.description}
              </p>
            </Hint>
          )}
          {notification.createdAt && (
            <p className="b5-regular text-neutral-500 mt-1">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          )}
        </div>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="b3-regular">
              <Button
                variant="ghost"
                className="text-red-500"
                disabled={isLoading}
                onClick={(e) => handleDelete(e)}
              >
                Delete Notification
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator className="bg-neutral-300" />
    </div>
  );
};

NotificationItem.Skeleton = function NotificationItemSkeleton() {
  return (
    <div className="rounded-md p-3 bg-white">
      <div className="flex items-start gap-x-2">
        <div className="flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full mt-2" />
          <Skeleton className="h-2 w-20 mt-2" />
        </div>
      </div>
    </div>
  );
};
