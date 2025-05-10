import { Bell } from "lucide-react";

import { formatCount } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NotificationItem } from "./notification-item";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useGetNotificationsQuery } from "../api";
import { markNotificationRead } from "@/features/app/notifications/socket-provider";
import { markNotificationAsRead } from "../slice";
import { useState } from "react";

export const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoading } = useGetNotificationsQuery();

  const { notifications, unreadCount } = useAppSelector(
    (state) => state.notifications
  );
  const dispatch = useAppDispatch();

  const handleNotificationClick = (notificationId: string) => {
    markNotificationRead(notificationId);
    dispatch(markNotificationAsRead(notificationId));
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div className="relative cursor-pointer">
          <Bell className="w-6 h-6 text-primary-600" />
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white rounded-full flex justify-center items-center b4-regular absolute -top-1.5 -right-1.5 w-[18px] h-[18px]">
              {formatCount(unreadCount)}
            </span>
          )}
        </div>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[400px] sm:w-[540px] flex flex-col min-h-0 overflow-hidden"
      >
        <SheetHeader>
          <SheetTitle className="h4-semibold text-primary-600">
            Notifications
          </SheetTitle>
        </SheetHeader>
        {isLoading && (
          <div className="flex flex-col gap-y-4 px-4">
            <NotificationItem.Skeleton />
            <NotificationItem.Skeleton />
            <NotificationItem.Skeleton />
            <NotificationItem.Skeleton />
            <NotificationItem.Skeleton />
            <NotificationItem.Skeleton />
          </div>
        )}
        {notifications && notifications.length > 0 ? (
          <div className="flex flex-col gap-y-1 flex-1 overflow-y-auto custom-scrollbar">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification.id)}
              />
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="flex justify-center items-center">
              You're all caught up. No new notifications at the moment.
            </div>
          )
        )}
      </SheetContent>
    </Sheet>
  );
};
