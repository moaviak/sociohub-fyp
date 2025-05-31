import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Announcement } from "@/types";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { useDeleteAnnouncementMutation } from "../api";
import ApiError from "@/features/api-error";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface AnnouncementOptionsProps {
  announcement: Announcement;
}

export const AnnouncementOptions = ({
  announcement,
}: AnnouncementOptionsProps) => {
  const [deleteAnnouncement, { isLoading }] = useDeleteAnnouncementMutation();

  const onDelete = async () => {
    try {
      const response = await deleteAnnouncement({
        announcementId: announcement.id,
        societyId: announcement.society?.id || "",
      }).unwrap();

      if (!("error" in response)) {
        toast.success("Announcement deleted successfully.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.errorMessage) {
        toast.error(apiError.errorMessage);
      } else {
        toast.error("Unexpected error occurred.");
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MoreHorizontal className="h-5 w-5 text-neutral-600" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border border-neutral-300">
        <DropdownMenuItem className="b3-regular">
          <Link
            to={`/edit-announcement/${announcement.id}`}
            state={{ announcement }}
            className="flex items-center gap-3"
          >
            <Edit className="h-4 w-4" />
            Edit Announcement
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="b3-regular">
          <Button
            variant={"ghost"}
            size={"inline"}
            className="text-red-600 p-0 group"
            onClick={onDelete}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4 text-red-500 group-hover:text-accent-foreground transition-colors" />
            Delete Announcement
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
