import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Society } from "@/types";
import { Link } from "expo-router";
import { View, Text } from "react-native";
import { useCancelJoinRequestMutation } from "../api";
import ApiError from "@/store/api-error";
import { SocietyLogo } from "@/components/society-logo";
import { useToastUtility } from "@/hooks/useToastUtility";

export const SocietyCard = ({ society }: { society: Society }) => {
  const [cancelJoinRequest, { isLoading }] = useCancelJoinRequestMutation();
  const toast = useToastUtility();

  const onCancelRequest = async () => {
    try {
      await cancelJoinRequest({ societyId: society.id }).unwrap();
      toast.showSuccessToast("Request successfully cancelled.");
    } catch (error) {
      const message = (error as ApiError).errorMessage;
      toast.showErrorToast(message || "An unexpected error occurred");
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
        <SocietyLogo society={society} className="flex-1" />
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
