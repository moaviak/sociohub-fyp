import { useEffect } from "react";
import { Text, View, ImageBackground, Image } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { router } from "expo-router";
import AuthBackground from "@/assets/images/auth-background.png";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "@/assets/images/logo_white-sociohub.png";
import { VerifyEmailInput } from "@/components/auth/verify-email-input";

const VerifyEmailPage = () => {
  return (
    <View className="items-center">
      <ImageBackground
        source={AuthBackground}
        resizeMode="cover"
        className="w-full h-[50vh]"
      >
        <SafeAreaView className="w-full h-full items-center py-4 gap-y-6">
          <Image source={Logo} className="h-[40px] w-[110px]" />
          <View className="max-w-[220px] gap-y-2">
            <Text className="text-white text-center font-heading text-4xl font-bold">
              Verify your Email
            </Text>
            <Text className="text-white font-body text-center text-sm">
              We've sent a 6 digit code to your email. Please enter it here to
              verify your email.
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
      <View className="w-[90%] bg-white rounded-xl relative top-[-20%] z-10 p-6">
        <VerifyEmailInput />
      </View>
    </View>
  );
};

export default VerifyEmailPage;
