import { Button, ButtonText } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { JoinRequest } from "@/types";
import { useState } from "react";
import { View, Text } from "react-native";
import { RequestForm } from "./request-form";

export const RequestCard = ({ request }: { request: JoinRequest }) => {
  const [showRequestForm, setShowRequestForm] = useState(false);

  return (
    <>
      <View className="flex-row items-center">
        <View className="flex-1">
          <UserAvatar user={request.student} />
        </View>
        <Button
          variant="outline"
          size="sm"
          onPress={() => setShowRequestForm(true)}
        >
          <ButtonText>View Request</ButtonText>
        </Button>
      </View>
      {showRequestForm && (
        <RequestForm
          open={showRequestForm}
          request={request}
          setOpen={setShowRequestForm}
        />
      )}
    </>
  );
};
