import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import RegistrationForm from "@/features/societies/registration-form";
import { useEffect } from "react";

const RegistrationFormScreen = () => {
  const { societyId } = useLocalSearchParams<{ societyId?: string }>();
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200">
        {/* Back Button */}
        <TouchableOpacity
          onPress={handleGoBack}
          className="mr-3 p-2 -ml-2"
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>

        {/* Header Title */}
        <Text className="flex-1 text-lg font-semibold text-gray-900">
          Society Registration Form
        </Text>
      </View>

      {/* Main Content */}
      <View className="flex-1 p-4 bg-white">
        <RegistrationForm societyId={societyId} />
      </View>
    </View>
  );
};

export default RegistrationFormScreen;
