import { Notification } from "@/types";
import { useNavigate } from "react-router";
import { toast as sonnerToast } from "sonner";

// Custom toast function that abstracts sonner toast API
export function toast(notification: Notification) {
  return sonnerToast.custom(
    (id) => <NotificationToast id={id} notification={notification} />,
    {
      position: "top-center",
      duration: 5000, // 5 seconds
    }
  );
}

// Props for our custom NotificationToast component
interface NotificationToastProps {
  id: string | number;
  notification: Notification;
}

// The actual toast component
export function NotificationToast({
  id,
  notification,
}: NotificationToastProps) {
  const { title, description, image, redirectUrl } = notification;
  const navigate = useNavigate();

  // Handle click on toast to redirect user
  const handleClick = () => {
    if (redirectUrl) {
      navigate(redirectUrl);
    }
    sonnerToast.dismiss(id);
  };

  return (
    <div
      className="flex rounded-lg bg-white shadow-lg ring-1 ring-black/5 w-[400px] sm:w-[540px] items-center p-4 cursor-pointer"
      onClick={handleClick}
    >
      {image && (
        <div className="mr-4 flex-shrink-0">
          <img
            src={image}
            alt=""
            className="h-10 w-10 rounded-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 items-center">
        <div className="w-full">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          {description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
