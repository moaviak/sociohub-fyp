import {
  View,
  Text,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import {
  useCreateCheckoutSessionMutation,
  useGetEventByIdQuery,
  useRegisterForEventMutation,
} from "./api";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonText } from "@/components/ui/button";
import { cn, formatEventDateTime, getRegistrationStatus } from "@/lib/utils";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import {
  Building,
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  Globe,
  LucideIcon,
  Layers2,
  ClipboardPen,
} from "lucide-react-native";
import { EventStatus, EventVisibility } from "./types";
import { SocietyLogo } from "@/components/society-logo";
import { format } from "date-fns";
import RenderHtml from "react-native-render-html";
import { UserType } from "@/types";
import { useAppSelector } from "@/store/hooks";
import { useState } from "react";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import ApiError from "@/store/api-error";
import { useToastUtility } from "@/hooks/useToastUtility";

const { width: screenWidth } = Dimensions.get("window");

const InfoRow = ({
  icon: IconComponent,
  label,
  children,
  className = "",
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <View className={`flex-row items-start gap-3 ${className}`}>
    <View className="mt-1">
      <IconComponent size={18} className="text-gray-500" />
    </View>
    <View className="" style={{ flex: 1, alignItems: "flex-start" }}>
      <Text className="font-body text-gray-700 mb-1 font-bold">{label}</Text>
      {children}
    </View>
  </View>
);

const Section = ({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <View
    className={`bg-white rounded-xl p-4 shadow-sm border border-gray-200 ${className}`}
  >
    <Heading className="font-heading text-lg text-gray-800 mb-4">
      {title}
    </Heading>
    {children}
  </View>
);

const EventDetail = ({ eventId }: { eventId: string }) => {
  const { userType } = useAppSelector((state) => state.auth);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const { data: event, isLoading: isFetching } = useGetEventByIdQuery(eventId);
  const [registerForEvent, { isLoading: isRegistering }] =
    useRegisterForEventMutation();
  const [createCheckoutSession, { isLoading: isCreatingCheckout }] =
    useCreateCheckoutSessionMutation();

  const { showErrorToast, showSuccessToast, showWarningToast } =
    useToastUtility();

  if (isFetching) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8fafc",
        }}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-500 mt-4">Loading event details...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8fafc",
        }}
      >
        <Text className="text-gray-500">Event not found</Text>
      </View>
    );
  }

  const deadlineDate = new Date(event?.registrationDeadline || "");
  const now = new Date();

  const canRegister =
    userType === UserType.STUDENT &&
    event.visibility === EventVisibility.Publish &&
    event?.registrationRequired &&
    now < deadlineDate &&
    event?.status === EventStatus.Upcoming;

  const registrationStatus = getRegistrationStatus(
    event?.registrationRequired || false,
    event?.registrationDeadline,
    event?.paidEvent,
    event?.isRegistered
  );

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case EventStatus.Ongoing:
        return {
          bg: "bg-success-100/50",
          border: "border-success-200",
          text: "text-success-700",
        };
      case EventStatus.Upcoming:
        return {
          bg: "bg-primary-100/50",
          border: "border-primary-200",
          text: "text-primary-700",
        };
      case EventStatus.Completed:
        return {
          bg: "bg-gray-100/50",
          border: "border-gray-200",
          text: "text-gray-700",
        };
      case EventStatus.Cancelled:
        return {
          bg: "bg-error-100/50",
          border: "border-error-200",
          text: "text-error-700",
        };
      default:
        return {
          bg: "bg-gray-100/50",
          border: "border-gray-200",
          text: "text-gray-700",
        };
    }
  };

  const statusColors = event.status ? getStatusColor(event.status) : undefined;

  const htmlContent = {
    html: event?.description || "<p>No description available</p>",
  };

  const isLoading = isRegistering || isCreatingCheckout || isProcessingPayment;

  const APP_SCHEME = "sociohub";
  const BASE_URL = `${APP_SCHEME}://`;

  const handleRegistration = async () => {
    if (!canRegister) return;

    setIsProcessingPayment(true);

    try {
      const registrationResponse = await registerForEvent(event.id).unwrap();

      if (registrationResponse.paymentRequired) {
        const successUrl = `${BASE_URL}payment-success?sesion_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${BASE_URL}payment-cancelled?eventId=${event.id}&payment_cancelled=true`;

        const checkoutResponse = await createCheckoutSession({
          eventId: event.id,
          registrationId: registrationResponse.registration.id,
          successUrl,
          cancelUrl,
        }).unwrap();

        if (Platform.OS === "web") {
          window.location.href = checkoutResponse.checkoutUrl;
          Linking.openURL(checkoutResponse.checkoutUrl);
        } else {
          const result = await WebBrowser.openBrowserAsync(
            checkoutResponse.checkoutUrl,
            {
              dismissButtonStyle: "cancel",
              readerMode: false,
              // This ensures the browser closes when redirecting back to app
              createTask: false,
            }
          );

          if (result.type === "cancel") {
            // User manually cancelled
            setIsProcessingPayment(false);
            showWarningToast("Payment was cancelled");
          }
        }
      } else {
        showSuccessToast("Successfully registered for the event");
      }
    } catch (error) {
      const message =
        (error as ApiError).errorMessage ||
        (error as Error).message ||
        "Unexpected error occurred. Please try again!";

      showErrorToast(message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <VStack space="lg" style={{ padding: 16 }}>
        {/* Header Section */}
        <View className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {event?.banner && (
            <Image
              source={{ uri: event.banner }}
              alt="Event Banner"
              style={{
                width: "100%",
                height: 200,
                backgroundColor: "#f3f4f6",
              }}
              resizeMode="cover"
            />
          )}

          <View className="p-4">
            <HStack
              style={{
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
              space="md"
            >
              <View style={{ flex: 1 }}>
                <Heading className="font-heading text-2xl text-gray-900 mb-2">
                  {event?.title}
                </Heading>
                {event?.tagline && (
                  <Text className="font-body text-gray-600 text-base leading-6">
                    {event.tagline}
                  </Text>
                )}
              </View>
            </HStack>

            {canRegister && !event.isRegistered && (
              <View className="mt-4">
                <Button
                  className="bg-primary-500 rounded-lg"
                  isDisabled={isLoading}
                  onPress={handleRegistration}
                >
                  {isLoading ? (
                    <>
                      <ActivityIndicator size={"small"} color={"#fff"} />
                      <ButtonText>
                        {isRegistering
                          ? "Registering..."
                          : isCreatingCheckout
                          ? "Creating Checkout..."
                          : "Processing..."}
                      </ButtonText>
                    </>
                  ) : (
                    <ButtonText>Register Now</ButtonText>
                  )}
                </Button>
              </View>
            )}
          </View>
        </View>

        {/* About Section */}
        <Section title="About This Event">
          <RenderHtml contentWidth={screenWidth - 64} source={htmlContent} />
        </Section>

        {/* Event Information */}
        <Section title="Event Information">
          <VStack space="lg">
            {event?.startDate &&
              event.startTime &&
              event.endDate &&
              event.endTime && (
                <InfoRow icon={Calendar} label="Date & Time">
                  <Text className="text-gray-600 leading-6">
                    {formatEventDateTime(
                      event.startDate,
                      event.endDate,
                      event.startTime,
                      event.endTime
                    )}
                  </Text>
                </InfoRow>
              )}

            {event?.eventType && (
              <InfoRow
                icon={event.eventType === "Physical" ? MapPin : Globe}
                label="Location"
              >
                {event.eventType === "Physical" ? (
                  <View>
                    <Text className="text-gray-900 font-medium">
                      {event.venueName}
                    </Text>
                    {event.venueAddress && (
                      <Text className="text-gray-600 text-sm mt-1">
                        {event.venueAddress}
                      </Text>
                    )}
                  </View>
                ) : (
                  <View>
                    <Text className="text-gray-900 font-medium">
                      Online via {event.platform}
                    </Text>
                    {event.accessInstructions && (
                      <Text className="text-gray-600 text-sm mt-1">
                        {event.accessInstructions}
                      </Text>
                    )}
                  </View>
                )}
              </InfoRow>
            )}

            {event?.categories && event.categories.length > 0 && (
              <InfoRow icon={Layers2} label="Categories">
                <View className="flex-row flex-wrap gap-2 mt-1">
                  {event.categories.map((category, i) => (
                    <Badge
                      key={i}
                      className="bg-gray-100 rounded-full px-3 py-1"
                    >
                      <BadgeText className="text-gray-700 text-xs">
                        {category}
                      </BadgeText>
                    </Badge>
                  ))}
                </View>
              </InfoRow>
            )}

            {event?.society && (
              <InfoRow icon={Building} label="Organized by">
                <View className="flex-row items-center mt-1">
                  <SocietyLogo society={event.society} />
                </View>
              </InfoRow>
            )}

            {event?.status && (
              <InfoRow icon={Clock} label="Status">
                <Badge
                  className={`${statusColors?.bg} ${statusColors?.border} rounded-full px-3 py-1 mt-1`}
                >
                  <BadgeText
                    className={`${statusColors?.text} text-sm font-medium`}
                  >
                    {event.status}
                  </BadgeText>
                </Badge>
              </InfoRow>
            )}
          </VStack>
        </Section>

        {/* Registration Information */}
        <Section title="Registration Information">
          <VStack space="lg">
            <InfoRow icon={ClipboardPen} label="Registration Status">
              <Badge
                className={cn(
                  "rounded-full px-3 py-1 mt-1",
                  registrationStatus === "Not required"
                    ? "bg-gray-200/50"
                    : registrationStatus === "Registration Open"
                    ? "bg-success-100/50 border-success-200"
                    : registrationStatus === "Registration Closed"
                    ? "bg-error-100/50 border-error-200"
                    : "bg-primary-100/50 border-primary-200"
                )}
              >
                <BadgeText
                  className={cn(
                    "text-sm font-medium",
                    registrationStatus === "Not required"
                      ? "text-gray-700"
                      : registrationStatus === "Registration Open"
                      ? "text-success-700"
                      : registrationStatus === "Registration Closed"
                      ? "text-error-700"
                      : "text-primary-700"
                  )}
                >
                  {registrationStatus}
                </BadgeText>
              </Badge>
            </InfoRow>

            {registrationStatus !== "Not required" && (
              <>
                <InfoRow icon={Users} label="Available Spots">
                  {event?.maxParticipants && event?._count !== undefined ? (
                    <Text className="text-gray-600">
                      <Text className="font-semibold text-gray-900">
                        {event.maxParticipants -
                          event._count.eventRegistrations}
                      </Text>{" "}
                      out of {event.maxParticipants} spots available
                    </Text>
                  ) : (
                    <Text className="text-gray-600">Unlimited spots</Text>
                  )}
                </InfoRow>

                {event?.registrationDeadline && (
                  <InfoRow icon={Clock} label="Registration Deadline">
                    <Text className="text-gray-600 font-medium">
                      {format(
                        new Date(event.registrationDeadline),
                        "EEE, MMM d | h:mm aa"
                      )}
                    </Text>
                  </InfoRow>
                )}

                {registrationStatus === "Paid Event" && event?.ticketPrice && (
                  <InfoRow icon={DollarSign} label="Ticket Price">
                    <Text className="text-gray-900 font-bold text-lg">
                      PKR {event.ticketPrice}
                    </Text>
                  </InfoRow>
                )}
              </>
            )}
          </VStack>
        </Section>
      </VStack>
    </ScrollView>
  );
};

export default EventDetail;
