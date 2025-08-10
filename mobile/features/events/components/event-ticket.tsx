import { View, Text, Image, ScrollView, Alert } from "react-native";
import { Event, Ticket } from "../types";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { X } from "lucide-react-native";
import { format } from "date-fns";
import { format24To12 } from "@/lib/utils";
import { TouchableOpacity } from "react-native";

export const EventTicket = ({
  open,
  setOpen,
  event,
  ticket,
}: {
  event: Event;
  ticket: Ticket;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  return (
    <AlertDialog isOpen={open} onClose={() => setOpen(false)}>
      <AlertDialogBackdrop />
      <AlertDialogContent className="bg-primary-500 border-primary-500">
        <AlertDialogHeader>
          <Text className="text-white text-lg font-semibold">Event Ticket</Text>
          <TouchableOpacity onPress={() => setOpen(false)}>
            <Icon as={X} className="text-white size-6" />
          </TouchableOpacity>
        </AlertDialogHeader>

        <AlertDialogBody className="mt-4">
          <View className="bg-white rounded-xl relative overflow-hidden p-2 gap-6">
            <View
              className="bg-primary-500 rounded-full absolute"
              style={{
                height: 40,
                width: 40,
                top: "50%",
                transform: "translateY(-15%)",
                left: -20,
              }}
            />
            <View
              className="bg-primary-500 rounded-full absolute"
              style={{
                height: 40,
                width: 40,
                top: "50%",
                transform: "translateY(-15%)",
                right: -20,
              }}
            />
            <View
              className="w-full border-2 border-primary-500 absolute"
              style={{
                height: 1,
                borderStyle: "dashed",
                top: "51%",
              }}
            />

            <View
              className="gap-4"
              style={{ height: "50%", paddingBottom: 32 }}
            >
              <HStack space="md" className="items-center mb-4">
                <Image
                  source={
                    event.banner
                      ? { uri: event.banner }
                      : require("@/assets/images/image-placeholder.png")
                  }
                  style={{ width: 56, height: 56 }}
                  className="rounded-lg"
                  resizeMode="cover"
                  defaultSource={require("@/assets/images/image-placeholder.png")}
                />
                <VStack className="flex-1">
                  <Text
                    className="text-gray-900 font-semibold text-base"
                    numberOfLines={2}
                  >
                    {event.title}
                  </Text>
                  {event.tagline && (
                    <Text
                      className="text-gray-600 text-sm mt-1"
                      numberOfLines={2}
                    >
                      {event.tagline}
                    </Text>
                  )}
                </VStack>
              </HStack>

              <VStack space="md">
                <View>
                  <Text className="text-gray-500 text-xs font-medium mb-1">
                    VENUE
                  </Text>
                  <Text className="text-gray-900 font-medium">
                    {event.venueName}
                  </Text>
                </View>

                <View>
                  <Text className="text-gray-500 text-xs font-medium mb-1">
                    DATE & TIME
                  </Text>
                  {event.startDate && event.startTime && (
                    <Text className="text-gray-900 font-medium">
                      {`${format(
                        new Date(event.startDate),
                        "EEEE, MMMM do yyyy"
                      )} | ${format24To12(event.startTime)}`}
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="text-gray-500 text-xs font-medium mb-1">
                    ATTENDEE NAME
                  </Text>
                  <Text className="text-gray-900 font-medium">
                    {`${event.registration?.student?.firstName} ${event.registration?.student?.lastName}`}
                  </Text>
                </View>

                <View>
                  <Text className="text-gray-500 text-xs font-medium mb-1">
                    REGISTRATION #
                  </Text>
                  <Text className="text-gray-900 font-medium">
                    {event.registration?.student?.registrationNumber}
                  </Text>
                </View>
              </VStack>
            </View>
            <View style={{ height: "50%" }} className="items-center">
              <Text className="text-gray-900 font-semibold text-base">
                Scan this QR code
              </Text>

              <View className="bg-gray-50 rounded-lg">
                <Image
                  source={{ uri: ticket.qrCode }}
                  style={{ width: 180, height: 180 }}
                  resizeMode="contain"
                />
              </View>

              {ticket.issuedAt && (
                <Text className="text-gray-500 text-sm">
                  Issued: {format(new Date(ticket.issuedAt), "MMMM do yyyy")}
                </Text>
              )}
            </View>
          </View>
        </AlertDialogBody>
      </AlertDialogContent>
    </AlertDialog>
  );
};
