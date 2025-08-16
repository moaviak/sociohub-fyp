// hooks/useToastUtility.tsx
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast";
import { Toast, ToastDescription } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { formatTimeShort } from "@/lib/utils";
import { Notification } from "@/types";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react-native"; // Add icons

export const useToastUtility = () => {
  const toast = useToast();

  const toastColors = {
    success: {
      bg: "#E8F7EE",
      text: "#276749",
      icon: <CheckCircle size={20} color="#276749" />,
    },
    warning: {
      bg: "#FFF9E6",
      text: "#92400E",
      icon: <AlertTriangle size={20} color="#92400E" />,
    },
    error: {
      bg: "#FDE8E8",
      text: "#9B1C1C",
      icon: <XCircle size={20} color="#9B1C1C" />,
    },
  };

  const showToast = (
    type: "success" | "warning" | "error",
    message: string,
    duration: number = 5000
  ) => {
    toast.show({
      duration,
      placement: "top",
      containerStyle: { marginTop: 36 },
      render: () => {
        const { bg, text, icon } = toastColors[type];
        return (
          <Toast
            style={{
              backgroundColor: bg,
              borderRadius: 12,
              paddingVertical: 10,
              paddingHorizontal: 14,
              minWidth: 280,
              maxWidth: 320,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 3,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <HStack space="sm" style={{ flex: 1, alignItems: "center" }}>
              {icon}
              <ToastDescription
                style={{ color: text, fontWeight: "500", flexShrink: 1 }}
                numberOfLines={3}
              >
                {message}
              </ToastDescription>
            </HStack>
          </Toast>
        );
      },
    });
  };

  const showNotificationToast = (notification: Notification) => {
    toast.show({
      placement: "top",
      containerStyle: { marginTop: 18 },
      render: ({ id }) => {
        const toastId = `toast-${id}`;

        return (
          <Toast
            nativeID={toastId}
            className="p-4 gap-3 w-full bg-background-0 shadow-hard-2 flex-row items-center"
            style={{
              minWidth: 280,
              maxWidth: 280,
            }}
          >
            {notification.image && (
              <Avatar>
                <AvatarImage
                  source={{
                    uri: notification.image,
                  }}
                />
              </Avatar>
            )}
            <VStack style={{ flex: 1 }}>
              <HStack className="justify-between" space="md">
                <Heading
                  size="sm"
                  className="text-typography-950"
                  numberOfLines={1}
                  style={{ flexShrink: 1 }}
                >
                  {notification.title}
                </Heading>
                {notification.createdAt && (
                  <Text size="sm" className="text-typography-500">
                    {formatTimeShort(notification.createdAt)}
                  </Text>
                )}
              </HStack>
              <Text size="sm" className="text-typography-500" numberOfLines={2}>
                {notification.description}
              </Text>
            </VStack>
          </Toast>
        );
      },
    });
  };

  const showSuccessToast = (message: string) => showToast("success", message);
  const showWarningToast = (message: string) => showToast("warning", message);
  const showErrorToast = (message: string, duration: number = 5000) =>
    showToast("error", message, duration);

  return {
    showToast,
    showSuccessToast,
    showWarningToast,
    showErrorToast,
    showNotificationToast,
  };
};
