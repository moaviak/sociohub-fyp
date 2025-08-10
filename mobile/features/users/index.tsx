import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useGetUserByIdQuery } from "./api";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonText } from "@/components/ui/button";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  Edit,
  IdCard,
  Mail,
  Phone,
  User,
  Users,
  GraduationCap,
  MessageCircle,
  LucideIcon,
  MessageCircleMore,
} from "lucide-react-native";
import { cn } from "@/lib/utils";
import { RolesBadges } from "../members/components/roles-badges";
import { Role, Society } from "@/types";
import { useAppSelector } from "@/store/hooks";
import { SocietyLogo } from "@/components/society-logo";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { EventTabs } from "./components/event-tabs";

interface InfoRowProps {
  icon: LucideIcon;
  label: string;
  value: string;
  isLast?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({
  icon: IconComponent,
  label,
  value,
  isLast = false,
}) => (
  <View
    className={cn(
      "flex-row items-center gap-3 py-3",
      !isLast && "border-b border-gray-200"
    )}
  >
    <View
      className="bg-secondary-100 rounded-full items-center justify-center"
      style={{
        width: 32,
        height: 32,
      }}
    >
      <IconComponent size={18} color={"#835ec7"} />
    </View>
    <View className="flex-1">
      <Text className="text-sm font-medium text-gray-900">{label}</Text>
      <Text className="text-sm text-gray-600 mt-1">{value}</Text>
    </View>
  </View>
);

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({
  title,
  children,
  className = "",
}) => (
  <View
    className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}
  >
    <View className="px-4 py-3 border-b border-gray-200">
      <Heading className="text-lg font-bold text-gray-900">{title}</Heading>
    </View>
    <View className="px-4">{children}</View>
  </View>
);

const SocietyCard: React.FC<{
  society: Society;
  roles?: Role[];
  onPress?: () => void;
}> = ({ society, roles = [], onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <HStack className="items-center" space="md">
      <SocietyLogo society={society} />
      {roles.length > 0 && (
        <View className="flex-row flex-wrap gap-1 mt-2">
          <RolesBadges roles={roles} />
        </View>
      )}
    </HStack>
  </TouchableOpacity>
);

const Profile = ({ userId }: { userId: string }) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { data: user, isLoading } = useGetUserByIdQuery({ id: userId });

  const router = useRouter();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-500 mt-4">Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-500">Profile not found</Text>
      </View>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;
  const isStudent = "registrationNumber" in user;
  const userType = isStudent ? "Student" : "Advisor";

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <VStack space="lg" style={{ padding: 16 }}>
        {/* Profile Header */}
        <View className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <HStack className="justify-between items-start" space="md">
            <VStack className="items-center flex-1" space="md">
              <Avatar
                className="bg-gradient-to-br from-primary-500 to-secondary-600"
                size={"2xl"}
              >
                <AvatarFallbackText className="text-white">{`${user.firstName} ${user.lastName}`}</AvatarFallbackText>
                <AvatarImage
                  source={{
                    uri: user.avatar,
                  }}
                />
              </Avatar>

              <VStack className="items-center" space="xs">
                <Heading className="text-xl font-bold text-gray-900 text-center">
                  {`${user.firstName} ${user.lastName}`}
                </Heading>

                <Badge className="bg-primary-100/50 border-primary-200 rounded-lg px-3 py-1">
                  <BadgeText className="text-primary-700 font-medium">
                    {userType}
                  </BadgeText>
                </Badge>

                {user.bio && (
                  <Text className="text-gray-600 text-center text-sm mt-2 leading-5">
                    {user.bio}
                  </Text>
                )}
              </VStack>
              <View>
                {isOwnProfile ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onPress={() =>
                      router.push(
                        isStudent
                          ? "/(student-tabs)/profile/edit-profile"
                          : "/(advisor-tabs)/profile/edit-profile"
                      )
                    }
                  >
                    <Icon as={Edit} className="mr-2 text-primary-500" />
                    <ButtonText>Edit Profile</ButtonText>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="rounded-lg">
                    <Icon
                      as={MessageCircleMore}
                      className="text-primary-500 mr-2"
                    />
                    <ButtonText>Send Message</ButtonText>
                  </Button>
                )}
              </View>
            </VStack>
          </HStack>
        </View>

        {/* Personal Information */}
        <Section title="Personal Information">
          <VStack>
            <InfoRow icon={Mail} label="Email Address" value={user.email} />

            {isStudent && "registrationNumber" in user && (
              <InfoRow
                icon={IdCard}
                label="Registration Number"
                value={user.registrationNumber!}
              />
            )}

            <InfoRow
              icon={Phone}
              label="Phone Number"
              value={user.phone || "Not provided"}
              isLast
            />
          </VStack>
        </Section>

        {/* Academic/Professional Information */}
        {isStudent ? (
          // Student Societies Section
          <Section title="Joined Societies">
            {user.societies && user.societies.length > 0 ? (
              <VStack space="md" className="py-2">
                {user.societies.map(({ society, roles }) => (
                  <SocietyCard
                    key={society.id}
                    society={society}
                    roles={roles || []}
                    onPress={() => {
                      // Navigate to society detail
                      // navigation.navigate('SocietyDetail', { societyId: society.id });
                      console.log("Navigate to society:", society.id);
                    }}
                  />
                ))}
              </VStack>
            ) : (
              <View className="py-8 items-center">
                <Icon as={Users} size="xl" className="text-gray-400 mb-3" />
                <Text className="text-gray-500 font-medium">
                  No societies joined yet
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  Join societies to connect with peers
                </Text>
              </View>
            )}
          </Section>
        ) : (
          // Advisor Society Section
          "society" in user &&
          user.society && (
            <Section title="Associated Society">
              <View className="py-2">
                <SocietyCard
                  society={user.society}
                  onPress={() => {
                    // Navigate to society detail
                    // navigation.navigate('SocietyDetail', { societyId: user.society.id });
                    console.log("Navigate to society:", user.society?.id);
                  }}
                />
              </View>
            </Section>
          )
        )}

        {/* Additional Stats Section (Optional) */}
        <Section title="Activity">
          <VStack>
            {isStudent && (
              <InfoRow
                icon={GraduationCap}
                label="Events Attended"
                value={user._count?.eventRegistrations.toString() || "0"}
              />
            )}
            <InfoRow
              icon={Users}
              label="Member Since"
              value={format(user.createdAt!, "MMMM yyyy")}
              isLast
            />
          </VStack>
        </Section>
      </VStack>
      {isStudent && isOwnProfile && <EventTabs />}
    </ScrollView>
  );
};

export default Profile;
