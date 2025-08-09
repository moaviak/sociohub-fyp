import React, { useState } from "react";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { HStack } from "@/components/ui/hstack";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { Role } from "@/types";
import { View, Text, TouchableOpacity } from "react-native";
import { Icon, EditIcon, TrashIcon } from "@/components/ui/icon";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
  Extrapolation,
} from "react-native-reanimated";
import { RoleForm } from "../role-form";
import { useDeleteRoleMutation } from "../api";
import useGetSocietyId from "@/hooks/useGetSocietyId";
import { Toast, ToastDescription, useToast } from "@/components/ui/toast";
import ApiError from "@/store/api-error";

export const RoleCard = ({ role }: { role: Role }) => {
  const [showEdit, setShowEdit] = useState(false);
  const toast = useToast();

  const societyId = useGetSocietyId();
  const [deleteRole, { isLoading }] = useDeleteRoleMutation();

  const LEFT_ACTIONS_WIDTH = 80;
  const RIGHT_ACTION_WIDTH = 80;
  const SWIPE_THRESHOLD = 100;
  const VELOCITY_THRESHOLD = 800;

  const translateX = useSharedValue(0);
  const isSwipeActive = useSharedValue(false);

  const resetPosition = () => {
    "worklet";
    translateX.value = withSpring(0);
    isSwipeActive.value = false;
  };

  const handleEdit = () => {
    setShowEdit(true);
    resetPosition();
  };

  const handleDelete = async () => {
    resetPosition();
    try {
      await deleteRole({ societyId, roleId: role.id }).unwrap();

      toast.show({
        duration: 5000,
        placement: "top",
        containerStyle: {
          marginTop: 18,
        },
        render: () => {
          return (
            <Toast action="success">
              <ToastDescription>Role successfully deleted</ToastDescription>
            </Toast>
          );
        },
      });
    } catch (error) {
      const message =
        (error as ApiError).errorMessage || "Unexpected error occurred";
      toast.show({
        duration: 10000,
        placement: "top",
        containerStyle: {
          marginTop: 18,
        },
        render: () => {
          return (
            <Toast action="error">
              <ToastDescription>{message}</ToastDescription>
            </Toast>
          );
        },
      });
    }
  };

  const panGesture = Gesture.Pan()
    .minDistance(20)
    .activeOffsetX([-30, 30])
    .failOffsetY([-15, 15])
    .onUpdate((event) => {
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
        if (translationX > 0) {
          // Swiped right - show left actions (Delete)
          translateX.value = withSpring(LEFT_ACTIONS_WIDTH);
        } else {
          // Swiped left - show right action (Edit)
          translateX.value = withSpring(-RIGHT_ACTION_WIDTH);
        }
      } else {
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
      {/* Left Action (Delete) */}
      {!isLoading && (
        <Animated.View
          className="absolute left-0 top-0 bottom-0 flex-row items-center justify-center bg-error-500 rounded-lg"
          style={[{ width: LEFT_ACTIONS_WIDTH }, leftActionsAnimatedStyle]}
        >
          <TouchableOpacity
            onPress={handleDelete}
            className="flex-1 items-center justify-center"
          >
            <Icon as={TrashIcon} className="text-white size-12" />
            <Text className="text-white text-xs mt-1">Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Right Action (Edit) */}
      <Animated.View
        className="absolute right-0 top-0 bottom-0 flex-row items-center justify-center bg-blue-500 rounded-lg"
        style={[{ width: RIGHT_ACTION_WIDTH }, rightActionsAnimatedStyle]}
      >
        <TouchableOpacity
          onPress={handleEdit}
          className="flex-1 items-center justify-center"
        >
          <Icon as={EditIcon} className="text-white size-12" />
          <Text className="text-white text-xs mt-1">Edit</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main Card Content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm"
          style={cardAnimatedStyle}
        >
          <HStack className="gap-3 items-center">
            <View className="flex-1">
              <Text className="text-lg font-semibold">{role.name}</Text>
              <Text className="text-sm text-neutral-600" numberOfLines={2}>
                {role.description}
              </Text>
            </View>
            <View className="w-32 gap-2">
              {role.assignedMembers && role.assignedMembers.length === 1 ? (
                <UserAvatar user={role.assignedMembers[0]} size="sm" />
              ) : role.assignedMembers && role.assignedMembers.length > 1 ? (
                role.assignedMembers?.map((member) => (
                  <View key={member.id} className="flex-row -space-x-1.5">
                    <Avatar
                      className="bg-gradient-to-br from-primary-500 to-secondary-600"
                      size="sm"
                    >
                      <AvatarFallbackText className="text-white">{`${member.firstName} ${member.lastName}`}</AvatarFallbackText>
                      <AvatarImage
                        source={{
                          uri: member.avatar,
                        }}
                      />
                    </Avatar>
                  </View>
                ))
              ) : (
                <View>
                  <Text>No assigned members</Text>
                </View>
              )}
            </View>
          </HStack>
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

      {showEdit && (
        <RoleForm role={role} open={showEdit} setOpen={setShowEdit} />
      )}
    </View>
  );
};

RoleCard.Skeleton = function () {
  return (
    <View className="flex-row items-center gap-3">
      <View className="flex-1 gap-2">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-full rounded" />
      </View>
    </View>
  );
};
