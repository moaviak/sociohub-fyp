// ScanTicket.tsx
import React, { useState } from "react";
import { icons } from "@/constants";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { QRScanner } from "./qr-scanner";
import ApiError from "@/store/api-error";
import { useScanTicketMutation } from "@/features/events/api";

export interface TicketData {
  registrationId: string;
  eventId: string;
  studentId: string;
  societyId: string;
}

export const ScanTicket = () => {
  const [scanTicket, { isLoading, isError, error }] = useScanTicketMutation();
  const [showScanner, setShowScanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedData, setScannedData] = useState<TicketData | null>(null);

  const handleScanPress = () => {
    if (isLoading || isProcessing) return;
    setShowScanner(true);
  };

  const handleScanSuccess = async (ticketData: TicketData) => {
    setScannedData(ticketData);
    setShowScanner(false);
    setIsProcessing(true);

    try {
      await scanTicket(ticketData).unwrap();
      Alert.alert(
        "✅ Success",
        "Ticket validated successfully! The participant can enter the event.",
        [
          {
            text: "OK",
            onPress: () => {
              setIsProcessing(false);
              setScannedData(null);
            },
          },
        ]
      );
    } catch (mutationError: any) {
      const errorMessage =
        (mutationError as ApiError).errorMessage ||
        "Failed to validate ticket. Please try again.";

      Alert.alert("❌ Validation Failed", errorMessage, [
        {
          text: "Try Again",
          onPress: () => {
            setIsProcessing(false);
            setScannedData(null);
            setShowScanner(true);
          },
        },
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            setIsProcessing(false);
            setScannedData(null);
          },
        },
      ]);
      console.error("Scan ticket mutation error:", mutationError);
    }
  };

  const handleScanCancel = () => {
    setShowScanner(false);
  };

  const getButtonText = () => {
    if (isProcessing) return "Validating Ticket...";
    if (isLoading) return "Processing...";
    return "Scan Ticket";
  };

  const getButtonIcon = () => {
    if (isProcessing || isLoading) {
      return null; // We'll add a spinner instead
    }
    return icons.qr;
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleScanPress}
        disabled={isLoading || isProcessing}
        className={`${
          isLoading || isProcessing ? "opacity-60" : "opacity-100"
        }`}
      >
        <View className="flex-row items-center gap-4 px-4 py-2">
          {getButtonIcon() ? (
            <Image source={getButtonIcon()} className="h-[32px] w-[32px]" />
          ) : (
            <View className="h-[32px] w-[32px] justify-center items-center">
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          )}
          <Text className="font-body font-semibold text-lg">
            {getButtonText()}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Processing Overlay */}
      {isProcessing && scannedData && (
        <Modal visible transparent animationType="fade">
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white rounded-xl p-6 mx-6 min-w-[280px]">
              <View className="items-center">
                <ActivityIndicator size="large" color="#007AFF" />
                <Text className="text-lg font-semibold mt-4 text-center text-gray-800">
                  Validating Ticket
                </Text>
                <Text className="text-sm text-gray-600 mt-2 text-center">
                  Please wait while we verify your ticket...
                </Text>

                {/* Show scanned data preview */}
                <View className="mt-4 p-3 bg-gray-50 rounded-lg w-full">
                  <Text className="text-xs text-gray-500 mb-1">
                    Ticket Details:
                  </Text>
                  <Text className="text-sm text-gray-700">
                    Registration: {scannedData.registrationId.slice(0, 8)}...
                  </Text>
                  <Text className="text-sm text-gray-700">
                    Event: {scannedData.eventId.slice(0, 12)}...
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {showScanner && (
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onCancel={handleScanCancel}
        />
      )}
    </>
  );
};
