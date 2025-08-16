import { View, Text, ActivityIndicator } from "react-native";
import { Announcement } from "../types";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from "@/components/ui/actionsheet";
import { Icon } from "@/components/ui/icon";
import { Edit, Trash2 } from "lucide-react-native";
import { Heading } from "@/components/ui/heading";
import { useDeleteAnnouncementMutation } from "../api";
import { useToastUtility } from "@/hooks/useToastUtility";
import ApiError from "@/store/api-error";

export const AnnouncementOptions = ({
  announcement,
  open,
  setOpen,
}: {
  announcement: Announcement;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const [deleteAnnouncement, { isLoading }] = useDeleteAnnouncementMutation();
  const toast = useToastUtility();

  const handleDelete = async () => {
    try {
      await deleteAnnouncement({
        announcementId: announcement.id,
        societyId: announcement.societyId!,
      }).unwrap();

      toast.showSuccessToast("Announcement deleted successfully.");
    } catch (error) {
      const message =
        (error as ApiError).errorMessage ||
        (error as Error).message ||
        "Unexpected error occurred.";

      toast.showErrorToast(message);
    }
  };

  return (
    <Actionsheet isOpen={open} onClose={() => setOpen(false)}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="pb-6">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <ActionsheetItem>
          <Icon as={Edit} />
          <ActionsheetItemText>Edit Announcement</ActionsheetItemText>
        </ActionsheetItem>
        <ActionsheetItem onPress={handleDelete} isDisabled={isLoading}>
          {!isLoading ? (
            <Icon as={Trash2} className="text-error-500" />
          ) : (
            <ActivityIndicator size={"small"} color={"#fb2c36"} />
          )}
          <ActionsheetItemText className="text-error-500">
            Delete Announcement
          </ActionsheetItemText>
        </ActionsheetItem>
      </ActionsheetContent>
    </Actionsheet>
  );
};
