import React, { useState } from "react";
import { UserAvatar } from "@/components/user-avatar";
import { Member } from "@/types/type";
import { View, Text, TouchableOpacity } from "react-native";
import { RolesBadges } from "./roles-badges";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";
import { MessageCircle, ClipboardList, Trash2 } from "lucide-react-native";
import { useAppSelector } from "@/store/hooks";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
  Extrapolation,
} from "react-native-reanimated";
import { checkPrivilege } from "@/lib/utils";
import { PRIVILEGES } from "@/constants";
import { AssignTask } from "./assign-task";
import { RemoveMember } from "./remove-member";

interface MemberCardProps {
  member: Member;
}

export const MemberCard = ({ member }: MemberCardProps) => {
  const [showAssignTask, setShowAssignTask] = useState(false);
  const [showRemoveMember, setShowRemoveMember] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const societyId = useGetSocietyId();

  const isStudent = user && "registrationNumber" in user;
  const haveMembersPrivilege = isStudent
    ? checkPrivilege(
        user.societies || [],
        societyId,
        PRIVILEGES.MEMBER_MANAGEMENT
      )
    : societyId === member.societyId;
  const haveTasksPrivilege = isStudent
    ? checkPrivilege(
        user.societies || [],
        societyId,
        PRIVILEGES.TASK_MANAGEMENT
      )
    : societyId === member.societyId;

  const translateX = useSharedValue(0);
  const isSwipeActive = useSharedValue(false);

  // Thresholds for swipe activation
  const SWIPE_THRESHOLD = 100;
  const VELOCITY_THRESHOLD = 800;
  const LEFT_ACTIONS_WIDTH =
    user?.id !== member.id ? (haveTasksPrivilege ? 160 : 80) : 0;
  const RIGHT_ACTION_WIDTH =
    user?.id !== member.id && haveMembersPrivilege ? 80 : 0;

  const resetPosition = () => {
    "worklet";
    translateX.value = withSpring(0);
    isSwipeActive.value = false;
  };

  const handleSendMessage = () => {
    resetPosition();
  };

  const handleAssignTask = () => {
    setShowAssignTask(true);
    resetPosition();
  };

  const handleRemoveMember = () => {
    setShowRemoveMember(true);
    resetPosition();
  };

  const panGesture = Gesture.Pan()
    .minDistance(20) // Require minimum distance before activation
    .activeOffsetX([-30, 30]) // Horizontal threshold to activate
    .failOffsetY([-15, 15]) // Allow vertical scrolling
    .onUpdate((event) => {
      // Only update if we're in an active swipe state or the movement is significant
      if (isSwipeActive.value || Math.abs(event.translationX) > 15) {
        isSwipeActive.value = true;
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      const { translationX, velocityX } = event;
      const isQuickSwipe = Math.abs(velocityX) > VELOCITY_THRESHOLD;
      const isSignificantSwipe = Math.abs(translationX) > SWIPE_THRESHOLD;

      if (isQuickSwipe || isSignificantSwipe) {
        // Determine final position based on swipe direction
        if (translationX > 0) {
          // Swiped right - show left actions (message/assign)
          translateX.value = withSpring(LEFT_ACTIONS_WIDTH);
        } else {
          // Swiped left - show right action (remove)
          translateX.value = withSpring(-RIGHT_ACTION_WIDTH);
        }
      } else {
        // Reset to center if swipe wasn't significant enough
        resetPosition();
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const leftActionsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          translateX.value,
          [0, LEFT_ACTIONS_WIDTH],
          [-LEFT_ACTIONS_WIDTH, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
    opacity: interpolate(
      translateX.value,
      [0, LEFT_ACTIONS_WIDTH / 2, LEFT_ACTIONS_WIDTH],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    ),
  }));

  const rightActionsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          translateX.value,
          [-RIGHT_ACTION_WIDTH, 0],
          [0, RIGHT_ACTION_WIDTH],
          Extrapolation.CLAMP
        ),
      },
    ],
    opacity: interpolate(
      translateX.value,
      [-RIGHT_ACTION_WIDTH, -RIGHT_ACTION_WIDTH / 2, 0],
      [1, 0.5, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <View className="relative">
      {/* Left Actions (Message & Assign Task) */}
      {user?.id !== member.id && (
        <Animated.View
          className="absolute left-0 top-0 bottom-0 flex-row bg-blue-500 rounded-lg"
          style={[
            {
              width: LEFT_ACTIONS_WIDTH,
            },
            leftActionsAnimatedStyle,
          ]}
        >
          <TouchableOpacity
            onPress={handleSendMessage}
            className="flex-1 items-center justify-center border-r border-blue-400"
          >
            <Icon as={MessageCircle} className="text-white size-12" />
            <Text className="text-white text-xs mt-1">Message</Text>
          </TouchableOpacity>
          {haveTasksPrivilege && (
            <TouchableOpacity
              onPress={handleAssignTask}
              className="flex-1 items-center justify-center"
            >
              <Icon as={ClipboardList} className="text-white size-12" />
              <Text className="text-white text-xs mt-1">Assign</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

      {/* Right Action (Remove Member) */}
      {user?.id !== member.id && haveMembersPrivilege && (
        <Animated.View
          className="absolute right-0 top-0 bottom-0 flex-row items-center justify-center bg-error-500 rounded-lg"
          style={[
            {
              width: RIGHT_ACTION_WIDTH,
            },
            rightActionsAnimatedStyle,
          ]}
        >
          <TouchableOpacity
            onPress={handleRemoveMember}
            className="flex-1 items-center justify-center"
          >
            <Icon as={Trash2} className="text-white size-12" />
            <Text className="text-white text-xs mt-1">Remove</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Main Card Content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm"
          style={cardAnimatedStyle}
        >
          <View className="flex-row items-center gap-3">
            <UserAvatar user={member} className="flex-1" />
            <RolesBadges roles={member.roles || []} />
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Tap outside to reset (invisible overlay when swiped) */}
      {translateX.value !== 0 && (
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "transparent",
          }}
          onPress={() => runOnJS(resetPosition)()}
          activeOpacity={1}
        />
      )}

      <AssignTask
        member={member}
        open={showAssignTask}
        setOpen={setShowAssignTask}
      />
      <RemoveMember
        member={member}
        open={showRemoveMember}
        setOpen={setShowRemoveMember}
      />
    </View>
  );
};

MemberCard.Skeleton = function () {
  return (
    <View className="flex-row items-center gap-3">
      <UserAvatar.Skeleton />
      <Skeleton className="h-4 w-10 rounded-lg" />
    </View>
  );
};
