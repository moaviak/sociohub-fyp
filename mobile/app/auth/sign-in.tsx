import { View, Text, Image, ImageBackground, Platform } from "react-native";

import Logo from "@/assets/images/logo_white-sociohub.png";
import { SignInForm } from "@/components/auth/sign-in-form";
import AuthBackground from "@/assets/images/auth-background.png";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const SignInPage = () => {
  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      extraScrollHeight={Platform.OS === "ios" ? 100 : 30}
      keyboardShouldPersistTaps="handled"
    >
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
                Sign in to your Account
              </Text>
              <Text className="text-white font-body text-center text-sm">
                Log in as Student or Advisor
              </Text>
            </View>
          </SafeAreaView>
        </ImageBackground>
        <View className="w-[90%] bg-white rounded-xl relative top-[-20%] z-10 p-6">
          <SignInForm />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};
export default SignInPage;
