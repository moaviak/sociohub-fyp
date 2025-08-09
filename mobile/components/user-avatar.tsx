import { Advisor, Student } from "@/types";
import { View, Text } from "react-native";
import { Avatar, AvatarFallbackText, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { Link } from "expo-router";

type Size = "sm" | "md" | "lg" | "xl";

const sizeConfig = {
  sm: {
    gap: "gap-1.5",
    avatar: "sm",
    nameText: "text-sm",
    subText: "text-xs",
    skeletonAvatar: "size-8",
    skeletonName: "h-3",
    skeletonSub: "h-2.5",
  },
  md: {
    gap: "gap-2",
    avatar: "md",
    nameText: "text-base",
    subText: "text-sm",
    skeletonAvatar: "size-10",
    skeletonName: "h-4",
    skeletonSub: "h-3",
  },
  lg: {
    gap: "gap-2.5",
    avatar: "lg",
    nameText: "text-lg",
    subText: "text-base",
    skeletonAvatar: "size-12",
    skeletonName: "h-5",
    skeletonSub: "h-3.5",
  },
  xl: {
    gap: "gap-3",
    avatar: "xl",
    nameText: "text-xl",
    subText: "text-lg",
    skeletonAvatar: "size-16",
    skeletonName: "h-6",
    skeletonSub: "h-4",
  },
} as const;

export const UserAvatar = ({
  user,
  className,
  size = "md",
}: {
  user: Student | Advisor;
  className?: string;
  size?: Size;
}) => {
  const isStudent = "registrationNumber" in user;
  const config = sizeConfig[size];

  return (
    <Link
      href={{
        pathname: "/profile/[id]",
        params: { id: user.id },
      }}
      className={className}
    >
      <View className={`flex-row items-center ${config.gap}`}>
        <Avatar
          className="bg-gradient-to-br from-primary-500 to-secondary-600"
          size={config.avatar as any}
        >
          <AvatarFallbackText className="text-white">{`${user.firstName} ${user.lastName}`}</AvatarFallbackText>
          <AvatarImage
            source={{
              uri: user.avatar,
            }}
          />
        </Avatar>
        <View className="flex-1">
          <Text
            className={`font-medium font-body ${config.nameText}`}
            numberOfLines={1}
            ellipsizeMode="tail"
          >{`${user.firstName} ${user.lastName}`}</Text>
          <Text
            className={`font-body text-neutral-600 ${config.subText}`}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {isStudent ? user.registrationNumber : "Society Advisor"}
          </Text>
        </View>
      </View>
    </Link>
  );
};

UserAvatar.Skeleton = function ({ size = "md" }: { size?: Size }) {
  const config = sizeConfig[size];

  return (
    <View className={`flex-row items-center ${config.gap} flex-1`}>
      <Skeleton className={`${config.skeletonAvatar} rounded-full`} />
      <View className="flex-1 gap-1">
        <Skeleton className={`${config.skeletonName} w-3/4 rounded`} />
        <Skeleton className={`${config.skeletonSub} w-1/2 rounded`} />
      </View>
    </View>
  );
};
