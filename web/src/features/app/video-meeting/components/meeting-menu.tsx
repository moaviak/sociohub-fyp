import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Meeting } from "@/types";
import { MoreHorizontal } from "lucide-react";
import { JoinMeetingButton } from "./join-meeting-button";
import useLoadingOverlay from "@/components/loading-overlay";

interface MeetingMenuProps {
  meeting: Meeting;
}

export const MeetingMenu: React.FC<MeetingMenuProps> = ({ meeting }) => {
  const { LoadingScreen, hideLoading, showLoading } = useLoadingOverlay();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="b3-regular">
          <JoinMeetingButton
            meeting={meeting}
            showLoading={showLoading}
            hideLoading={hideLoading}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
      <LoadingScreen />
    </DropdownMenu>
  );
};
