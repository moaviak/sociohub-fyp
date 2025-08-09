import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Society } from "@/types";
import { Link } from "expo-router";
import { Building } from "lucide-react-native";
import { View, Text } from "react-native";
import { useCancelJoinRequestMutation } from "../api";
import { Toast, ToastDescription, useToast } from "@/components/ui/toast";
import ApiError from "@/store/api-error";
import { SocietyLogo } from "@/components/society-logo";

export const SocietyCard = ({ society }: { society: Society }) => {
  const [cancelJoinRequest, { isLoading }] = useCancelJoinRequestMutation();
  const toast = useToast();

  const onCancelRequest = async () => {
    try {
      await cancelJoinRequest({ societyId: society.id }).unwrap();
      toast.show({
        duration: 5000,
        placement: "top",
        containerStyle: {
          marginTop: 18,
        },
        render: () => {
          return (
            <Toast action="success">
              <ToastDescription>
                Request successfully cancelled.
              </ToastDescription>
            </Toast>
          );
        },
      });
    } catch (error) {
      const message = (error as ApiError).errorMessage;
      toast.show({
        duration: 10000,
        placement: "top",
        containerStyle: {
          marginTop: 18,
        },
        render: () => {
          return (
            <Toast action="error">
              <ToastDescription>
                {message || "An unexpected error occurred"}
              </ToastDescription>
            </Toast>
          );
        },
      });
    }
  };

  return (
    <Link
      href={{
        pathname: "/society/[id]",
        params: { id: society.id },
      }}
    >
      <View className="flex-row items-center">
        <SocietyLogo society={society} />
        {!society.acceptingNewMembers ? (
          <></>
        ) : society.isMember || society.hasRequestedToJoin ? (
          <Button
            variant="outline"
            isDisabled={society.isMember || isLoading}
            onPress={onCancelRequest}
            className={`rounded-md ${
              society.hasRequestedToJoin
                ? "border-error-500"
                : "border-primary-500"
            }`}
          >
            <Text
              className={
                society.hasRequestedToJoin
                  ? "text-error-500"
                  : "text-primary-500"
              }
            >
              {society.hasRequestedToJoin ? "Cancel" : "Joined"}
            </Text>
          </Button>
        ) : (
          <Button className="bg-primary-500 rounded-md">
            <Link
              href={{
                pathname: "/(student-tabs)/explore/registration-form",
                params: { societyId: society.id },
              }}
            >
              <Text className="text-white">Join</Text>
            </Link>
          </Button>
        )}
      </View>
    </Link>
  );
};

SocietyCard.Skeleton = function () {
  return (
    <View className="flex-row items-center gap-3">
      {/* Avatar skeleton */}
      <Skeleton className="w-12 h-12 rounded-full" />

      {/* Name skeleton */}
      <View className="flex-1">
        <Skeleton className="h-4 w-3/4 rounded" />
      </View>

      {/* Button skeleton */}
      <Skeleton className="w-16 h-8 rounded-md" />
    </View>
  );
};
