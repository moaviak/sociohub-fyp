import { Link, useRouter } from "expo-router";
import { View, Text, ImageBackground, Image, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, Icon } from "@/components/ui/icon";
import Logo from "@/assets/images/logo_white-sociohub.png";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthBackground from "@/assets/images/auth-background.png";
import { StudentForm } from "@/components/auth/sign-up/student-form";

const SignUpStudentPage = () => {
  const router = useRouter();

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
          <SafeAreaView className="w-full h-full items-center py-4 gap-y-6 relative">
            <Button
              onPress={() => router.back()}
              variant="link"
              className="absolute left-6 top-14"
            >
              <Icon as={ArrowLeftIcon} className="text-white w-6 h-6" />
            </Button>
            <Image source={Logo} className="h-[40px] w-[110px]" />
            <View className="max-w-[220px] gap-y-2">
              <Text className="text-white text-center font-heading text-4xl font-bold">
                Sign up as Student
              </Text>
              <Text className="text-white font-body text-center text-sm">
                Already have an account?{" "}
                <Link href="/auth/sign-in" className="underline">
                  Login
                </Link>
              </Text>
            </View>
          </SafeAreaView>
        </ImageBackground>
        <View className="w-[90%] bg-white rounded-xl relative top-[-20%] z-10 p-6">
          <StudentForm />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};
export default SignUpStudentPage;
