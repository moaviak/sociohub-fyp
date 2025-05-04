import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ImageBackground, Image } from "react-native";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, Icon } from "@/components/ui/icon";
import Logo from "@/assets/images/logo_white-sociohub.png";
import AuthBackground from "@/assets/images/auth-background.png";
import Student from "@/assets/images/student.png";
import Advisor from "@/assets/images/advisor.png";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";

const SignUpPathPage = () => {
  const router = useRouter();

  return (
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
              Sign up
            </Text>
            <Text className="text-white font-body text-center text-sm">
              Please select your role to continue.
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
      <View className="w-[90%] bg-white rounded-xl relative top-[-20%] z-10 p-6">
        <VStack className="gap-y-4">
          <HStack className="w-full gap-x-2 items-center">
            <Image source={Student} className="w-[70px] h-[80px]" />
            <VStack className="py-4 px-2 flex-1">
              <Text className="font-heading text-primary-500 text-2xl font-bold">
                I am a Student
              </Text>
              <Text className="font-body text-primary-900 max-w-full">
                Discover and join societies, participate in events, and stay
                updated.
              </Text>

              <Button
                className="my-2 rounded-lg bg-primary-500"
                onPress={() => router.push("/auth/sign-up-student")}
              >
                <Text className="text-white">Student Signup</Text>
              </Button>
            </VStack>
          </HStack>

          <Text className="text-center font-body text-neutral-400">or</Text>

          <HStack className="w-full gap-x-2 items-center">
            <Image source={Advisor} className="w-[70px] h-[80px]" />
            <VStack className="py-4 px-2 flex-1">
              <Text className="font-heading text-secondary-500 text-2xl font-bold">
                I am a Society Advisor
              </Text>
              <Text className="font-body text-primary-900 max-w-full">
                Register and manage your society, create events, and collaborate
                with members.
              </Text>

              <Button
                className="my-2 rounded-lg bg-secondary-500 data-[hover=true]:bg-secondary-600 data-[active=true]:bg-secondary-700"
                onPress={() => router.push("/auth/sign-up-advisor")}
              >
                <Text className="text-white">Advisor Signup</Text>
              </Button>
            </VStack>
          </HStack>
        </VStack>
      </View>
    </View>
  );
};
export default SignUpPathPage;
