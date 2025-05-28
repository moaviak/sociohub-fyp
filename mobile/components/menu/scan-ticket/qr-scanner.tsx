// QRScanner.tsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import { BarcodeScanningResult } from "expo-camera";
import { TicketData } from "./scan-ticket";

interface QRScannerProps {
  onScanSuccess: (ticketData: TicketData) => void;
  onCancel: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onCancel,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      try {
        // Check if permission is already granted
        const { status: existingStatus } =
          await Camera.getCameraPermissionsAsync();

        if (existingStatus === "granted") {
          setHasPermission(true);
          setIsRequestingPermission(false);
          return;
        }

        // Request permission if not granted
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
      } catch (error) {
        console.error("Error requesting camera permission:", error);
        setHasPermission(false);
      } finally {
        setIsRequestingPermission(false);
      }
    };

    getCameraPermissions();
  }, []);

  const validateTicketData = (data: any): data is TicketData => {
    return (
      typeof data === "object" &&
      data !== null &&
      typeof data.registrationId === "string" &&
      typeof data.eventId === "string" &&
      typeof data.studentId === "string" &&
      typeof data.societyId === "string" &&
      data.registrationId.trim() !== "" &&
      data.eventId.trim() !== "" &&
      data.studentId.trim() !== "" &&
      data.societyId.trim() !== ""
    );
  };

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    if (scanned) return;

    setScanned(true);

    try {
      // Parse the QR code data (assuming it's JSON)
      const parsedData = JSON.parse(data);

      // Validate the data structure
      if (validateTicketData(parsedData)) {
        onScanSuccess(parsedData);
      } else {
        Alert.alert(
          "Invalid QR Code",
          "The scanned QR code does not contain valid ticket data.",
          [
            {
              text: "Scan Again",
              onPress: () => setScanned(false),
            },
            {
              text: "Cancel",
              onPress: onCancel,
            },
          ]
        );
      }
    } catch (parseError) {
      Alert.alert(
        "Invalid QR Code",
        "The scanned QR code is not in the correct format.",
        [
          {
            text: "Scan Again",
            onPress: () => setScanned(false),
          },
          {
            text: "Cancel",
            onPress: onCancel,
          },
        ]
      );
      console.error("QR code parsing error:", parseError);
    }
  };

  const handlePermissionDenied = () => {
    Alert.alert(
      "Camera Permission Required",
      "Camera access is required to scan QR codes. Please enable camera permission in your device settings.",
      [
        {
          text: "Cancel",
          onPress: onCancel,
          style: "cancel",
        },
        {
          text: "Retry",
          onPress: async () => {
            setIsRequestingPermission(true);
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
            setIsRequestingPermission(false);
          },
        },
      ]
    );
  };

  // Show loading while requesting permission
  if (isRequestingPermission) {
    return (
      <Modal visible animationType="slide" onRequestClose={onCancel}>
        <View className="flex-1 justify-center items-center bg-white p-5">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="mt-5 text-base text-center text-gray-800">
            Requesting camera permission...
          </Text>
          <TouchableOpacity
            onPress={onCancel}
            className="mt-6 px-5 py-3 bg-gray-200 rounded-lg"
          >
            <Text className="text-gray-600 text-center font-semibold">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  // Handle permission denied
  if (hasPermission === false) {
    return (
      <Modal visible animationType="slide" onRequestClose={onCancel}>
        <View className="flex-1 justify-center items-center bg-white p-5">
          <Text className="text-2xl font-bold mb-5 text-center text-gray-800">
            Camera Permission Required
          </Text>
          <Text className="text-base text-center text-gray-600 leading-6 mb-8">
            To scan QR codes, this app needs access to your camera. Please grant
            camera permission to continue.
          </Text>
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={onCancel}
              className="px-5 py-3 bg-gray-200 rounded-lg min-w-[120px]"
            >
              <Text className="text-gray-600 text-center font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                setIsRequestingPermission(true);
                const { status } = await Camera.requestCameraPermissionsAsync();
                setHasPermission(status === "granted");
                setIsRequestingPermission(false);
                if (status !== "granted") {
                  handlePermissionDenied();
                }
              }}
              className="px-5 py-3 bg-blue-500 rounded-lg min-w-[120px]"
            >
              <Text className="text-white text-center font-semibold">
                Grant Permission
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Show camera scanner
  return (
    <Modal visible animationType="slide" onRequestClose={onCancel}>
      <View className="flex-1 bg-black">
        <View className="flex-row justify-between items-center pt-12 px-5 pb-5 bg-black/80">
          <Text className="text-white text-lg font-bold">Scan QR Code</Text>
          <TouchableOpacity onPress={onCancel} className="p-2">
            <Text className="text-white text-2xl font-bold">✕</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 relative">
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            mode="picture"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            onCameraReady={() => {
              console.log("Camera is ready");
              setCameraReady(true);
            }}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          />

          {/* Loading indicator while camera initializes */}
          {!cameraReady && (
            <View className="absolute inset-0 justify-center items-center bg-black/50">
              <ActivityIndicator size="large" color="white" />
              <Text className="text-white mt-4">Initializing camera...</Text>
            </View>
          )}

          {/* Scanning overlay */}
          <View className="absolute inset-0 justify-center items-center pointer-events-none">
            <View className="w-64 h-64 border-2 border-white rounded-lg bg-transparent" />
            <Text className="text-white text-base mt-5 text-center bg-black/60 px-3 py-2 rounded-lg">
              Position the QR code within the frame
            </Text>
            {scanned && (
              <Text className="text-white text-sm mt-2 text-center bg-black/80 px-2 py-1 rounded-lg">
                Processing...
              </Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};
