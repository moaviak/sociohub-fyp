import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image, ImageBackground, Platform } from "react-native";

import Logo from "@/assets/images/logo_white-sociohub.png";
import AuthBackground from "@/assets/images/auth-background.png";
import { SocietyForm } from "@/components/auth/society-form";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const SocietyFormPage = () => {
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
                Create Society
              </Text>
              <Text className="text-white font-body text-center text-sm">
                Enter details to register your society.
              </Text>
            </View>
          </SafeAreaView>
        </ImageBackground>
        <View className="w-[90%] bg-white rounded-xl relative top-[-20%] z-10 p-6">
          <SocietyForm />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default SocietyFormPage;
