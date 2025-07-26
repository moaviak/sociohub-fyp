import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Play,
  XCircle,
} from "lucide-react";
import { TeamTask } from "../types";

export const TaskOptions: React.FC<{
  task: TeamTask;
  handleStatusChange: (status: TeamTask["status"]) => void;
}> = ({ task, handleStatusChange }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => handleStatusChange("TO_DO")}
          disabled={task.status === "TO_DO"}
        >
          <AlertCircle className="mr-2 h-4 w-4 text-yellow-600" />
          Mark as Pending
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => handleStatusChange("IN_PROGRESS")}
          disabled={task.status === "IN_PROGRESS"}
        >
          <Play className="mr-2 h-4 w-4 text-blue-600" />
          Mark as In Progress
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => handleStatusChange("COMPLETED")}
          disabled={task.status === "COMPLETED"}
        >
          <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
          Mark as Completed
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => handleStatusChange("CANCELLED")}
          disabled={task.status === "CANCELLED"}
        >
          <XCircle className="mr-2 h-4 w-4 text-inherit" />
          Cancel Task
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
