// hooks/useToastUtility.tsx (note the .tsx extension)
import { useToast } from "@/components/ui/toast";
import { Toast, ToastDescription } from "@/components/ui/toast";

export const useToastUtility = () => {
  const toast = useToast();

  const showToast = (
    type: "success" | "warning" | "error",
    message: string,
    duration: number = 5000
  ) => {
    toast.show({
      duration,
      placement: "top",
      containerStyle: { marginTop: 18 },
      render: () => (
        <Toast action={type}>
          <ToastDescription>{message}</ToastDescription>
        </Toast>
      ),
    });
  };

  const showSuccessToast = (message: string) => showToast("success", message);
  const showWarningToast = (message: string) => showToast("warning", message);
  const showErrorToast = (message: string, duration: number = 10000) =>
    showToast("error", message, duration);

  return {
    showToast,
    showSuccessToast,
    showWarningToast,
    showErrorToast,
  };
};
