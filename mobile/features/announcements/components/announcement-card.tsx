import React, { useState } from "react";
import { Announcement } from "../types";
import { HStack } from "@/components/ui/hstack";
import { SocietyLogo } from "@/components/society-logo";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { View, TouchableOpacity } from "react-native";
import { formatTimeShort } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { MoreVertical } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { AnnouncementOptions } from "./announcement-options";

export const AnnouncementCard = ({
  announcement,
  havePrivilege,
}: {
  announcement: Announcement;
  havePrivilege?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSeeMore, setShowSeeMore] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleTextLayout = (event: any) => {
    const { lines } = event.nativeEvent;
    if (lines.length > 5) {
      setShowSeeMore(true);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <HStack
        space="xs"
        className="bg-white rounded-lg drop-shadow-md px-3 py-2"
      >
        {announcement.society && (
          <SocietyLogo society={announcement.society} avatarOnly />
        )}
        <VStack space="xs" className="flex-1">
          <HStack className="items-center" space="sm">
            <Text
              size="sm"
              style={{ fontWeight: "500", flexShrink: 1 }}
              className="text-neutral-900"
              numberOfLines={1}
            >
              {announcement.society?.name || "Unknown Society"}
            </Text>
            <View
              style={{
                height: 4,
                width: 4,
                backgroundColor: "#737373",
                borderRadius: 999,
              }}
            />
            <Text
              size="xs"
              className="text-neutral-500"
              style={{ flexShrink: 1, flex: 1, flexGrow: 1 }}
            >
              {announcement.publishDateTime || announcement.createdAt
                ? formatTimeShort(
                    announcement.publishDateTime || announcement.createdAt!
                  )
                : ""}
            </Text>
            {havePrivilege && (
              <Button variant="link" onPress={() => setShowOptions(true)}>
                <Icon as={MoreVertical} />
              </Button>
            )}
          </HStack>
          <Text className="font-bold" numberOfLines={2}>
            {announcement.title}
          </Text>
          <VStack space="xs">
            <Text
              numberOfLines={isExpanded ? undefined : 5}
              onTextLayout={handleTextLayout}
            >
              {announcement.content}
            </Text>
            {showSeeMore && (
              <TouchableOpacity onPress={toggleExpanded}>
                <Text
                  size="sm"
                  className="text-primary-500"
                  style={{ fontWeight: "500", color: "#218bff" }}
                >
                  {isExpanded ? "See less" : "See more"}
                </Text>
              </TouchableOpacity>
            )}
          </VStack>
        </VStack>
      </HStack>
      {showOptions && (
        <AnnouncementOptions
          announcement={announcement}
          open={showOptions}
          setOpen={setShowOptions}
        />
      )}
    </>
  );
};
