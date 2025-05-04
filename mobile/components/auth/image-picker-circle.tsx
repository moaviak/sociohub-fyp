import React, { useState } from "react";
import { View, Image, Pressable, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Camera } from "lucide-react-native";
import { UseFormReturn } from "react-hook-form";

interface ImagePickerCircleProps {
  form: UseFormReturn<
    {
      name: string;
      description: string;
      logo?: any;
    },
    any,
    {
      name: string;
      description: string;
      logo?: any;
    }
  >;
}

export const ImagePickerCircle = ({ form }: ImagePickerCircleProps) => {
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Function to convert an image URI to a File object
  const uriToFile = async (
    uri: string,
    fileName: string,
    fileType: string
  ): Promise<File | undefined> => {
    try {
      // Convert base64 to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Create a File from the blob
      // Note: In React Native, we create a File-like object since the native File constructor isn't available
      const file = new File([blob], fileName, { type: fileType });

      return file;
    } catch (error) {
      console.error("Error converting URI to File:", error);
      return undefined;
    }
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      aspect: [1, 1],
      allowsEditing: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      setImageUri(selectedAsset.uri);

      // Extract file extension from URI
      let uriParts = selectedAsset.uri.split(".");
      let fileExtension = uriParts[uriParts.length - 1];

      // Ensure file extension is valid
      if (!fileExtension || fileExtension.length > 4) {
        fileExtension = "jpg";
      }

      // Create file object with necessary properties for React Native FormData
      const fileForUpload = {
        uri:
          Platform.OS === "ios"
            ? selectedAsset.uri.replace("file://", "")
            : selectedAsset.uri,
        type: `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`,
        name: `image_${Date.now()}.${fileExtension}`,
      };

      console.log("File object created:", fileForUpload);

      // Set the file object in the form
      form.setValue("logo", fileForUpload);
    }
  };

  return (
    <View className="items-center justify-center mt-4">
      <Pressable
        onPress={pickImage}
        className="w-24 h-24 rounded-full border-2 border-primary-500 items-center justify-center relative"
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            className="w-[95%] h-[95%] rounded-full"
            resizeMode="cover"
          />
        ) : (
          <Image
            source={require("@/assets/images/placeholder.png")} // fallback placeholder
            className="w-[95%] h-[95%] rounded-full opacity-80"
          />
        )}

        <View className="absolute -bottom-1 -right-1 bg-blue-600 p-2 rounded-full">
          <Camera size={16} color="white" />
        </View>
      </Pressable>
    </View>
  );
};
