import React, { useState, useEffect } from "react";
import { View, Image, Pressable, Platform, Alert, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera, X, ImageIcon } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";

type ImageUploadSize = "sm" | "md" | "lg" | "xl";

interface ImageFileObject {
  uri: string;
  type: string;
  name: string;
  size?: number;
}

interface ImageUploadProps {
  onFileSelect?: (file: ImageFileObject) => void;
  onFileRemove?: () => void;
  maxSizeMB?: number;
  className?: string;
  disabled?: boolean;
  uploadText?: string;
  initialImage?: string;
  onInitialImageRemove?: () => void;
  size?: ImageUploadSize;
  quality?: number;
  allowsEditing?: boolean;
  aspect?: [number, number];
  showRemoveButton?: boolean;
  placeholder?: any; // For require() images
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onFileSelect,
  onFileRemove,
  maxSizeMB = 5,
  className = "",
  disabled = false,
  uploadText = "Upload Photo",
  initialImage,
  onInitialImageRemove,
  size = "md",
  quality = 0.8,
  allowsEditing = true,
  aspect = [1, 1],
  showRemoveButton = true,
  placeholder,
}) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [hasInitialImage, setHasInitialImage] = useState<boolean>(false);

  // Initialize with existing image
  useEffect(() => {
    if (initialImage) {
      setHasInitialImage(true);
      setImageUri(null); // Clear any selected image when initial image is provided
    }
  }, [initialImage]);

  // Size configurations
  const sizeConfig = {
    sm: {
      container: "w-16 h-16",
      camera: "sm",
      cameraContainer: "w-6 h-6",
      removeButton: "w-5 h-5 -top-1 -right-1",
      removeIcon: "xs",
      changeOverlay: "w-4 h-4",
      textSize: "text-xs",
    },
    md: {
      container: "w-24 h-24",
      camera: "md",
      cameraContainer: "w-8 h-8",
      removeButton: "w-6 h-6 -top-2 -right-2",
      removeIcon: "sm",
      changeOverlay: "w-5 h-5",
      textSize: "text-sm",
    },
    lg: {
      container: "w-32 h-32",
      camera: "lg",
      cameraContainer: "w-10 h-10",
      removeButton: "w-7 h-7 -top-2 -right-2",
      removeIcon: "md",
      changeOverlay: "w-6 h-6",
      textSize: "text-base",
    },
    xl: {
      container: "w-40 h-40",
      camera: "xl",
      cameraContainer: "w-12 h-12",
      removeButton: "w-8 h-8 -top-3 -right-3",
      removeIcon: "lg",
      changeOverlay: "w-7 h-7",
      textSize: "text-lg",
    },
  };

  const currentSizeConfig = sizeConfig[size];

  // Convert bytes to MB
  const bytesToMB = (bytes: number): number => bytes / (1024 * 1024);

  // Create file object for React Native FormData
  const createFileObject = (
    asset: ImagePicker.ImagePickerAsset
  ): ImageFileObject => {
    let uriParts = asset.uri.split(".");
    let fileExtension = uriParts[uriParts.length - 1];

    // Ensure file extension is valid
    if (!fileExtension || fileExtension.length > 4) {
      fileExtension = "jpg";
    }

    return {
      uri: Platform.OS === "ios" ? asset.uri.replace("file://", "") : asset.uri,
      type: `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`,
      name: `image_${Date.now()}.${fileExtension}`,
      size: asset.fileSize,
    };
  };

  // Validate file size
  const validateFileSize = (asset: ImagePicker.ImagePickerAsset): boolean => {
    if (asset.fileSize && maxSizeMB) {
      const fileSizeMB = bytesToMB(asset.fileSize);
      if (fileSizeMB > maxSizeMB) {
        Alert.alert(
          "File too large",
          `Image size (${fileSizeMB.toFixed(
            2
          )}MB) exceeds the maximum limit of ${maxSizeMB}MB.`,
          [{ text: "OK" }]
        );
        return false;
      }
    }
    return true;
  };

  // Show image picker options
  const showImagePicker = () => {
    if (disabled) return;

    Alert.alert("Select Image", "Choose an option to select an image", [
      { text: "Camera", onPress: openCamera },
      { text: "Gallery", onPress: openGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // Open camera
  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Camera permission is required to take photos!"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality,
      aspect,
      allowsEditing,
    });

    handleImageResult(result);
  };

  // Open gallery
  const openGallery = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Media library permission is required to select photos!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality,
      aspect,
      allowsEditing,
    });

    handleImageResult(result);
  };

  // Handle image picker result
  const handleImageResult = (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets.length > 0) {
      const selectedAsset = result.assets[0];

      // Validate file size
      if (!validateFileSize(selectedAsset)) {
        return;
      }

      // Set image URI for preview
      setImageUri(selectedAsset.uri);
      setHasInitialImage(false); // Clear initial image when new file is selected

      // Create file object and call callback
      const fileObject = createFileObject(selectedAsset);
      onFileSelect?.(fileObject);
    }
  };

  // Remove photo
  const removePhoto = () => {
    if (imageUri) {
      setImageUri(null);
      onFileRemove?.();
    } else if (hasInitialImage) {
      setHasInitialImage(false);
      onInitialImageRemove?.();
    }
  };

  // Get current image source
  const getCurrentImageSource = () => {
    if (imageUri) {
      return { uri: imageUri };
    } else if (hasInitialImage && initialImage) {
      return { uri: initialImage };
    } else if (placeholder) {
      return placeholder;
    }
    return null;
  };

  const currentImageSource = getCurrentImageSource();
  const hasImage = !!currentImageSource;

  return (
    <View className={`items-center ${className}`}>
      {/* Upload Area */}
      <Pressable
        onPress={showImagePicker}
        disabled={disabled}
        className={`
          relative border-2 border-dashed rounded-full ${
            currentSizeConfig.container
          }
          border-gray-300 bg-gray-50 items-center justify-center
          ${disabled ? "opacity-50" : "active:opacity-70"}
        `}
      >
        {hasImage ? (
          <>
            {/* Display current image */}
            <Image
              source={currentImageSource}
              className="w-full h-full rounded-full"
              resizeMode="cover"
            />

            {/* Remove button */}
            {showRemoveButton && !disabled && (imageUri || hasInitialImage) && (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  removePhoto();
                }}
                className={`absolute ${currentSizeConfig.removeButton} bg-red-500 rounded-full items-center justify-center shadow-lg`}
              >
                <Icon
                  as={X}
                  size={currentSizeConfig.removeIcon as any}
                  className="text-white"
                />
              </Pressable>
            )}

            {/* Change photo overlay */}
            <View className="absolute inset-0 bg-black opacity-0 active:opacity-30 rounded-full items-center justify-center">
              <Icon
                as={Camera}
                size={currentSizeConfig.camera as any}
                className="text-white"
              />
            </View>
          </>
        ) : (
          <>
            {/* Upload placeholder */}
            <View
              className={`bg-gray-600 rounded-lg ${currentSizeConfig.cameraContainer} items-center justify-center mb-1`}
            >
              <Icon
                as={Camera}
                size={currentSizeConfig.camera as any}
                className="text-white"
              />
            </View>
          </>
        )}
      </Pressable>

      {/* Upload Text */}
      <Pressable onPress={showImagePicker} disabled={disabled} className="mt-3">
        <Text
          className={`text-primary-500 font-medium text-center ${
            currentSizeConfig.textSize
          } ${disabled ? "opacity-50" : "active:opacity-70"}`}
        >
          {hasImage ? "Change Photo" : uploadText}
        </Text>
      </Pressable>
    </View>
  );
};
