import { useEffect, useState } from "react";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export const LoadingOverlay = ({ isVisible, message }: LoadingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop with blur effect */}
      <div className="absolute inset-0 backdrop-blur-[2px] "></div>

      {/* Loading content container */}
      <div className="bg-white rounded-lg p-6 shadow-xl z-10 flex flex-col items-center">
        {/* Spinner */}
        <div className="w-20 h-20 border-4 border-t-primary-600 border-r-transparent border-b-primary-600 border-l-transparent rounded-full animate-spin mb-4"></div>

        {/* Message */}
        {message && (
          <p className="text-gray-700 font-medium text-lg">{message}</p>
        )}
      </div>
    </div>
  );
};

export default function useLoadingOverlay(
  externalLoadingState: boolean | null = null
) {
  const [internalLoading, setInternalLoading] = useState(false);
  const [message, setMessage] = useState("Loading...");

  // Determine if we should show the loading based on either internal state or external state
  const loading =
    externalLoadingState !== null ? externalLoadingState : internalLoading;

  // Watch for changes in external loading state to update message
  useEffect(() => {
    if (externalLoadingState && !internalLoading) {
      // If external loading started but we weren't showing loading, use default message
      setMessage("Loading...");
    }
  }, [externalLoadingState, internalLoading]);

  const showLoading = (customMessage: string) => {
    setMessage(customMessage || "Loading...");
    setInternalLoading(true);
  };

  const hideLoading = () => {
    setInternalLoading(false);
  };

  const LoadingScreen = () => (
    <LoadingOverlay isVisible={loading} message={message} />
  );

  return {
    LoadingScreen,
    showLoading,
    hideLoading,
    loading,
  };
}
