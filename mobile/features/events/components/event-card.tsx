import React, { useState } from "react";
import { Event, EventStatus, EventVisibility } from "../types";
import { HStack } from "@/components/ui/hstack";
import { ActivityIndicator, Image } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { checkPrivilege, formatEventDateTime } from "@/lib/utils";
import { View, Text, TouchableOpacity } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
} from "react-native-reanimated";
import { Icon } from "@/components/ui/icon";
import { CirclePlus, TrashIcon, Ticket } from "lucide-react-native";
import { useAppSelector } from "@/store/hooks";
import { PRIVILEGES } from "@/constants";
import { Advisor } from "@/types";
import { useCancelEventMutation, useDeleteEventMutation } from "../api";
import { Toast, ToastDescription, useToast } from "@/components/ui/toast";
import ApiError from "@/store/api-error";
import { useRouter } from "expo-router";
import { EventTicket } from "./event-ticket";

interface EventCardProps {
  event: Event;
  variant?: "default" | "registered";
}

export const EventCard = ({ event, variant = "default" }: EventCardProps) => {
  const toast = useToast();
  const user = useAppSelector((state) => state.auth.user);
  const router = useRouter();

  const isStudent = user && "registrationNumber" in user;
  const havePrivilege = isStudent
    ? checkPrivilege(
        user.societies || [],
        event.societyId!,
        PRIVILEGES.EVENT_MANAGEMENT
      )
    : (user as Advisor).societyId === event.societyId;

  const [cancelEvent, { isLoading: isCancelling }] = useCancelEventMutation();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

  const [showTicket, setShowTicket] = useState(false);

  const getStatusBadgeColor = (status: EventStatus) => {
    switch (status) {
      case EventStatus.Ongoing:
        return { bg: "bg-primary-100/50", borderColor: "border-primary-400" };
      case EventStatus.Upcoming:
        return {
          bg: "bg-secondary-100/50",
          borderColor: "border-secondary-400",
        };
      case EventStatus.Completed:
        return { bg: "bg-success-100/50", borderColor: "border-success-400" };
      case EventStatus.Cancelled:
        return { bg: "bg-error-100/50", borderColor: "border-error-400" };
      default:
        return { bg: "bg-gray-100/50", borderColor: "border-gray-400" };
    }
  };

  // Early return for registered variant - simpler UI without swipe functionality
  if (variant === "registered") {
    return (
      <>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/event/[id]",
              params: { id: event.id },
            })
          }
          activeOpacity={0.8}
        >
          <Card className="bg-white rounded-lg shadow-gray-300 shadow-md overflow-hidden p-0">
            <HStack className="" style={{ height: 120 }} space="md">
              <Image
                source={
                  event.banner
                    ? { uri: event.banner }
                    : require("@/assets/images/image-placeholder.png")
                }
                alt={event.title}
                style={{ width: 100, height: "100%", objectFit: "cover" }}
                defaultSource={require("@/assets/images/image-placeholder.png")}
              />
              <VStack
                className="p-2"
                style={{ flex: 1, justifyContent: "space-between" }}
              >
                <VStack>
                  <Text
                    className="text-gray-900 font-semibold text-base"
                    numberOfLines={2}
                  >
                    {event.title}
                  </Text>
                  {event.startDate &&
                    event.startTime &&
                    event.endDate &&
                    event.endTime && (
                      <Text className="text-sm text-gray-600" numberOfLines={2}>
                        {formatEventDateTime(
                          event.startDate,
                          event.endDate,
                          event.startTime,
                          event.endTime
                        )}
                      </Text>
                    )}
                </VStack>
                {event.isRegistered && event.registration?.ticket ? (
                  <TouchableOpacity
                    className="bg-primary-500 px-4 py-2 rounded-md flex-row items-center justify-center self-start"
                    onPress={() => {
                      setShowTicket(true);
                    }}
                  >
                    <Icon as={Ticket} className="text-white size-4 mr-2" />
                    <Text className="text-white text-sm font-medium">
                      View Ticket
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    className="bg-transparent border border-primary-500 px-4 py-2 rounded-md flex-row items-center justify-center self-start"
                    disabled
                  >
                    <Text className="text-primary-500 text-sm font-medium">
                      Registered
                    </Text>
                  </TouchableOpacity>
                )}
              </VStack>
            </HStack>
          </Card>
        </TouchableOpacity>
        {showTicket && event.registration?.ticket && (
          <EventTicket
            event={event}
            ticket={event.registration?.ticket}
            open={showTicket}
            setOpen={setShowTicket}
          />
        )}
      </>
    );
  }

  // Default variant with swipe functionality
  const RIGHT_ACTION_WIDTH = havePrivilege ? 80 : 0;
  const SWIPE_THRESHOLD = 100;
  const VELOCITY_THRESHOLD = 800;

  const translateX = useSharedValue(0);
  const isSwipeActive = useSharedValue(false);

  const resetPosition = () => {
    "worklet";
    translateX.value = withSpring(0);
    isSwipeActive.value = false;
  };

  const handleDelete = async () => {
    try {
      await deleteEvent({
        eventId: event.id,
        societyId: event.societyId!,
      }).unwrap();

      toast.show({
        duration: 5000,
        placement: "top",
        containerStyle: {
          marginTop: 18,
        },
        render: () => {
          return (
            <Toast action="success">
              <ToastDescription>Event successfully deleted</ToastDescription>
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
    } finally {
      resetPosition();
    }
  };

  const handleCancel = async () => {
    try {
      await cancelEvent({
        eventId: event.id,
        societyId: event.societyId!,
      }).unwrap();

      toast.show({
        duration: 5000,
        placement: "top",
        containerStyle: {
          marginTop: 18,
        },
        render: () => {
          return (
            <Toast action="success">
              <ToastDescription>Event successfully cancelled</ToastDescription>
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
    } finally {
      resetPosition();
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
      if ((isQuickSwipe || isSignificantSwipe) && translationX < 0) {
        // Swiped left - show right action (Delete)
        translateX.value = withSpring(-RIGHT_ACTION_WIDTH);
      } else {
        resetPosition();
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
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
      {/* Right Action (Delete) */}
      {havePrivilege && (
        <Animated.View
          className="absolute right-0 top-0 bottom-0 flex-row items-center justify-center bg-error-500 rounded-lg"
          style={[{ width: RIGHT_ACTION_WIDTH }, rightActionsAnimatedStyle]}
        >
          {event.visibility &&
          (event.visibility === EventVisibility.Draft ||
            event.status === EventStatus.Completed) ? (
            <TouchableOpacity
              onPress={handleDelete}
              className="flex-1 items-center justify-center"
              disabled={isDeleting}
            >
              {!isDeleting ? (
                <Icon as={TrashIcon} className="text-white size-12" />
              ) : (
                <ActivityIndicator size={"small"} color={"#fff"} />
              )}
              <Text className="text-white text-xs mt-1">Delete</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 items-center justify-center"
              disabled={isCancelling}
            >
              {!isCancelling ? (
                <Icon
                  as={CirclePlus}
                  className="text-white size-12 rotat"
                  style={{
                    transform: [{ rotate: "45deg" }],
                  }}
                />
              ) : (
                <ActivityIndicator size={"small"} color={"#fff"} />
              )}
              <Text className="text-white text-xs mt-1">Cancel</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
      {/* Main Card Content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={cardAnimatedStyle}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/event/[id]",
                params: { id: event.id },
              })
            }
            activeOpacity={0.8}
          >
            <Card className="bg-white rounded-lg shadow-gray-300 shadow-md overflow-hidden p-0">
              <HStack className="" style={{ height: 120 }} space="md">
                <Image
                  source={
                    event.banner
                      ? { uri: event.banner }
                      : require("@/assets/images/image-placeholder.png")
                  }
                  alt={event.title}
                  style={{ width: 100, height: "100%", objectFit: "cover" }}
                  defaultSource={require("@/assets/images/image-placeholder.png")}
                />
                <VStack
                  className="py-2"
                  style={{ flex: 1, alignItems: "flex-start" }}
                >
                  {event.status && (
                    <Badge
                      size="sm"
                      variant="outline"
                      style={{}}
                      className={`rounded-md ${
                        getStatusBadgeColor(event.status).bg
                      } ${getStatusBadgeColor(event.status).borderColor}`}
                    >
                      <BadgeText
                        className={`text-xs ${
                          event.status === EventStatus.Ongoing
                            ? "text-primary-500"
                            : event.status === EventStatus.Upcoming
                            ? "text-secondary-500"
                            : event.status === EventStatus.Completed
                            ? "text-success-500"
                            : "text-error-500"
                        }`}
                      >
                        {event.status}
                      </BadgeText>
                    </Badge>
                  )}
                  <Text
                    className="text-gray-900 font-semibold mt-2"
                    numberOfLines={2}
                  >
                    {event.title}
                  </Text>
                  {/* Date and Time */}
                  {event.startDate &&
                    event.startTime &&
                    event.endDate &&
                    event.endTime && (
                      <Text className="text-sm text-gray-600" numberOfLines={2}>
                        {formatEventDateTime(
                          event.startDate,
                          event.endDate,
                          event.startTime,
                          event.endTime
                        )}
                      </Text>
                    )}
                  {event.ticketPrice && event.ticketPrice > 0 ? (
                    <Text
                      className="text-sm font-semibold text-gray-800"
                      style={{ marginTop: "auto" }}
                    >
                      RS {event.ticketPrice}
                    </Text>
                  ) : (
                    <Text
                      className="text-sm font-semibold text-gray-800"
                      style={{ marginTop: "auto" }}
                    >
                      Free
                    </Text>
                  )}
                </VStack>
              </HStack>
            </Card>
          </TouchableOpacity>
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
    </View>
  );
};
